import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { getSystemInstruction } from '../config/assistantPrompt.js';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

// Just check key is present and not placeholder
const isValidKey = apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here';

if (!isValidKey) {
  console.warn('⚠️  GEMINI_API_KEY not set in .env file. Bot will use static fallback replies.');
} else {
  console.log('✅ Gemini API key loaded. Key prefix:', apiKey.substring(0, 6) + '...');
}

const genAI = isValidKey ? new GoogleGenerativeAI(apiKey) : null;

// In-memory store for active conversations per sender
const activeSessions = new Map();

// Reset conversation history after 30 minutes of inactivity
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

// Correct Gemini model names in priority order (as of 2026)
const CANDIDATE_MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.0-flash-latest'];

export async function generateAssistantReply(senderId, senderName, incomingMessage) {
  // If API key is missing or invalid, return static fallback
  if (!genAI) {
    console.log(`⚠️  AI unavailable — sending static fallback reply to ${senderName}`);
    return `Namaste ${senderName}! 🙏 Welcome to *Vastu Vihar*.\n\nAapka message receive ho gaya hai. Hamari team aapse jald hi contact karegi.\n\n📞 More info ke liye hume call/message karein.`;
  }

  const now = Date.now();
  let session = activeSessions.get(senderId);

  // Check if session exists and is still fresh
  if (!session || (now - session.lastActivity > SESSION_TIMEOUT_MS)) {
    session = {
      history: [],
      isFirstMessage: true,
      lastActivity: now
    };
    activeSessions.set(senderId, session);
  } else {
    session.isFirstMessage = false;
    session.lastActivity = now;
  }

  let lastError = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      console.log(`🤖 Trying model: ${modelName}`);
      const systemInstruction = getSystemInstruction(senderName, session.isFirstMessage);

      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction,
      });

      // Start chat with current session history (up to last 10 messages)
      const chat = model.startChat({
        history: session.history.slice(-10)
      });

      const result = await chat.sendMessage(incomingMessage);
      const response = await result.response;
      const text = response.text().trim();

      // Save turns into session history only on success
      session.history.push({ role: 'user', parts: [{ text: incomingMessage }] });
      session.history.push({ role: 'model', parts: [{ text }] });

      console.log(`✅ Reply generated using model: ${modelName}`);
      return text;

    } catch (err) {
      console.warn(`⚠️  Model "${modelName}" failed: ${err.message}`);
      lastError = err;
    }
  }

  // All models failed — log the real error and send fallback
  console.error('❌ All Gemini models failed. Last error:', lastError?.message);

  if (session.isFirstMessage) {
    return `Namaste ${senderName}! 🙏 Welcome to *Vastu Vihar*.\n\nAapka message receive ho gaya hai. Hamari team aapse jald sampark karegi.`;
  }
  return `Aapka message receive ho gaya hai. *Vastu Vihar* team aapko jald update karegi. 🙏`;
}
