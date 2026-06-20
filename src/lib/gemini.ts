// Shared Gemini client
import { GoogleGenAI } from "@google/genai";

let _client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (_client) return _client;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing GEMINI_API_KEY environment variable. " +
      "Get one at https://aistudio.google.com/apikey and add it to our .env file."
    );
  }

  _client = new GoogleGenAI({ apiKey });
  return _client;
}


export async function chatCompletion({
  messages,
  temperature = 0.4,
  model = "gemini-3.5-flash",
}: {
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  temperature?: number;
  model?: string;
}): Promise<string> {
  const client = getGeminiClient();

  // Separate system instruction from conversation messages
  const systemInstruction = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");

  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: m.content }],
    }));

  const response = await client.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: systemInstruction || undefined,
      temperature,
    },
  });

  return response.text ?? "";
}
