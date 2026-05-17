import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function callLLM(systemPrompt, history, userMessage) {
  const formattedHistory = history.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const contents = [
    ...formattedHistory,
    { role: 'user', parts: [{ text: userMessage }] }
  ];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: contents,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json", 
    }
  });

  const text = response.text;

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("Raw LLM Output:", text);
    throw new Error('LLM did not return a valid JSON object.');
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Failed to parse JSON string:", jsonMatch[0]);
    throw new Error('LLM returned malformed JSON.');
  }
}