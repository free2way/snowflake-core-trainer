import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { QuizQuestion, LabScenario } from '@/lib/types';

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// 生成解释
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, context } = body;

    if (!topic || !context) {
      return NextResponse.json(
        { error: 'Missing topic or context' },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();
    const prompt = `
      You are an expert Snowflake trainer preparing a student for the SnowPro Core exam.
      Explain the topic: "${topic}".
      Context/Module: "${context}".
      
      Provide a concise but deep technical explanation. 
      Use Markdown for formatting.
      Include:
      1. Concept Definition.
      2. Key Exam details (what tricks usually appear in the exam).
      3. A small SQL snippet example if applicable.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const explanation = response.text || "Failed to generate explanation.";

    return NextResponse.json({ 
      success: true, 
      explanation 
    });

  } catch (error) {
    console.error("Gemini Explanation API Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate explanation. Please check your API configuration.",
        success: false 
      },
      { status: 500 }
    );
  }
}
