import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// 聊天API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { history, message } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Missing message' },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();
    
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: history || [],
      config: {
        systemInstruction: "You are a friendly but strict Snowflake Certified Trainer. You answer questions accurately regarding the SnowPro Core exam. Keep answers concise.",
      }
    });
    
    const result = await chat.sendMessage({ message });
    const responseText = result.text || "I couldn't process that response.";

    return NextResponse.json({ 
      success: true, 
      response: responseText
    });

  } catch (error) {
    console.error("Gemini Chat API Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to get response. Please check your API configuration.",
        success: false,
        response: "I'm having trouble connecting right now."
      },
      { status: 500 }
    );
  }
}
