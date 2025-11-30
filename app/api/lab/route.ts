import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { LabScenario } from '@/lib/types';

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// 生成实验场景
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
      Create a practical Snowflake hands-on lab scenario for: "${moduleTitle}".
      The lab should help pass the SnowPro Core exam.
      
      Return ONLY a raw JSON object. Do not wrap in Markdown.
      Structure:
      {
        "title": "string",
        "description": "string",
        "steps": [
          {
            "step": number,
            "instruction": "string",
            "sql": "string (optional SQL command)",
            "explanation": "string (why we do this)"
          }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.INTEGER },
                  instruction: { type: Type.STRING },
                  sql: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["step", "instruction", "explanation"]
              }
            }
          },
          required: ["title", "description", "steps"]
        }
      }
    });

    const labText = response.text || "{}";
    
    let labScenario: LabScenario | null = null;
    try {
      labScenario = JSON.parse(labText);
    } catch (parseError) {
      console.error("Failed to parse lab JSON:", parseError);
      // Return null if parsing fails
    }

    return NextResponse.json({ 
      success: true, 
      labScenario 
    });

  } catch (error) {
    console.error("Gemini Lab API Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate lab. Please check your API configuration.",
        success: false,
        labScenario: null
      },
      { status: 500 }
    );
  }
}
