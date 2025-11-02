
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    number: {
      type: Type.INTEGER,
      description: "The number represented by the hand gesture (1-10). Returns 0 if not recognizable or invalid.",
    },
  },
  required: ["number"],
};

export async function recognizeHandGesture(base64ImageData: string): Promise<number | null> {
  try {
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64ImageData,
      },
    };
    
    const textPart = {
      text: `Analyze this image of a hand gesture. The user is attempting to show a number between 1 and 10 using their fingers. Respond with a JSON object containing a single key 'number'. The value should be the integer you identified. If the gesture is not a clear number between 1 and 10, the value should be 0.`
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);

    if (result && typeof result.number === 'number') {
      return result.number;
    }

    return null;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get a response from the AI model.");
  }
}
