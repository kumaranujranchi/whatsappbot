import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { getSystemInstruction, OWNER_NAME } from '../config/assistantPrompt.js';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = (apiKey && apiKey !== 'your_gemini_api_key_here') ? new GoogleGenerativeAI(apiKey) : null;

// In-memory store for active conversations per sender
const activeSessions = new Map();

// Reset conversation history after 30 minutes of inactivity
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export async function generateAssistantReply(senderId, senderName, incomingMessage) {
  if (!genAI) {
    return `[Auto-Reply Assistant]: Namaste ${senderName}! Main ${OWNER_NAME} ka Personal Assistant hu. ${OWNER_NAME} abhi busy hain.`;
  }

  const now = Date.now();
  let session = activeSessions.get(senderId);

  // Check if session exists and is fresh
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

  try {
    const systemInstruction = getSystemInstruction(senderName, session.isFirstMessage);
    const candidateModels = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
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

        // Save turns into session history
        session.history.push({ role: 'user', parts: [{ text: incomingMessage }] });
        session.history.push({ role: 'model', parts: [{ text: text }] });

        return text;
      } catch (err) {
        lastError = err;
      }
    }

    if (lastError) {
      throw lastError;
    }
  } catch (error) {
    console.error('Error generating AI response:', error.message);
    if (session.isFirstMessage) {
      return `Namaste ${senderName}! Main ${OWNER_NAME} ka Assistant hu. ${OWNER_NAME} abhi busy hain, aapka message receive ho gaya hai!`;
    }
    return `Aapka message receive ho gaya hai, main ${OWNER_NAME} ko inform kar dunga!`;
  }
}
