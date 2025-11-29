import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, LabScenario } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateExplanation = async (topic: string, context: string): Promise<string> => {
  try {
    const ai = getAiClient();
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
    
    return response.text || "Failed to generate explanation.";
  } catch (error) {
    console.error("Gemini Explanation Error:", error);
    return "Error connecting to AI Tutor. Please check your API key.";
  }
};

export const generateQuiz = async (moduleTitle: string): Promise<QuizQuestion[]> => {
  try {
    const ai = getAiClient();
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

    if (!response.text) return [];
    return JSON.parse(response.text) as QuizQuestion[];
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    return [];
  }
};

export const generateLab = async (moduleTitle: string): Promise<LabScenario | null> => {
  try {
    const ai = getAiClient();
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

    if (!response.text) return null;
    return JSON.parse(response.text) as LabScenario;
  } catch (error) {
    console.error("Gemini Lab Error:", error);
    return null;
  }
};

export const chatWithTutor = async (history: {role: string, parts: {text: string}[]}[], message: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: history,
      config: {
        systemInstruction: "You are a friendly but strict Snowflake Certified Trainer. You answer questions accurately regarding the SnowPro Core exam. Keep answers concise.",
      }
    });
    
    const result = await chat.sendMessage({ message });
    return result.text || "I couldn't process that response.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having trouble connecting right now.";
  }
};
