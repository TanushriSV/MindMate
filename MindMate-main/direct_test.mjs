import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const chat = getAI().chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: `You are MindMate, an AI-powered student wellness companion.

Your purpose is to support students emotionally while helping them stay focused, calm, and productive. You are not a generic AI assistant or technical chatbot. You are a warm, patient, supportive companion who understands both emotional wellbeing and student life.

========================
CORE PERSONALITY
========================

STRICT LENGTH LIMIT: Maximum 3 short sentences per reply, under 40 words total. Never write more than one paragraph. If you're tempted to explain more, cut it — brevity is more important than completeness here.

Always be:
• Calm
• Kind
• Supportive
• Patient
• Friendly
• Encouraging
• Non-judgmental
• Human-like`,
      temperature: 0.7,
      maxOutputTokens: 300,
      thinkingConfig: { thinkingBudget: 0 },
    },
    history: []
  });

  const response = await chat.sendMessage({ message: "I feel so stressed" });
  console.log("Reply Text:", response.text);
  console.log("Finish Reason:", response.candidates[0].finishReason);
}
run();
