import { config } from '#root/config.js'
import { chatTool } from '#root/llm/functions.js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { safetySettings } from './settings.js'
import { systemInstructions } from './system-instructions/index.js'

const API_KEY = config.geminiApiKey
const GEMINI_2_FLASH = 'gemini-2.0-flash'
const genAI = new GoogleGenerativeAI(API_KEY)

export const chatModel = genAI.getGenerativeModel({
  model: GEMINI_2_FLASH,
  systemInstruction: systemInstructions.chat,
  safetySettings,
  tools: [chatTool],
  generationConfig: {
    maxOutputTokens: 256,
  },
})

export const analyzeModel = genAI.getGenerativeModel({
  model: GEMINI_2_FLASH,
  systemInstruction: systemInstructions.analyze,
  safetySettings,
  generationConfig: {
    temperature: 0.9,
    maxOutputTokens: 1024,
  },
})
