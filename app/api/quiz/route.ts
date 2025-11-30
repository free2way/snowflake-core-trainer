import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { QuizQuestion } from '@/lib/types';

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// 生成测验题目
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { moduleTitle } = body;

    if (!moduleTitle) {
      return NextResponse.json(
        { error: 'Missing moduleTitle' },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();
    const prompt = `
      Create 3 challenging multiple-choice practice questions for the Snowflake topic: "${moduleTitle}".
      Focus on SnowPro Core exam nuances.
      
      Return ONLY a raw JSON array. Do not wrap in Markdown code blocks.
      Structure:
      [
        {
          "id": number,
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": index_number,
          "explanation": "string"
        }
      ]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["id", "question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    const quizText = response.text || "[]";
    
    let quizQuestions: QuizQuestion[] = [];
    try {
      quizQuestions = JSON.parse(quizText);
    } catch (parseError) {
      console.error("Failed to parse quiz JSON:", parseError);
      // Return empty array if parsing fails
    }

    return NextResponse.json({ 
      success: true, 
      quizQuestions 
    });

  } catch (error) {
    console.error("Gemini Quiz API Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate quiz. Please check your API configuration.",
        success: false,
        quizQuestions: []
      },
      { status: 500 }
    );
  }
}
