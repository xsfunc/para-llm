import type { Content, GenerateContentResult, GenerativeModel } from '@google/generative-ai'
import { config } from '#root/config.js'
import { chatModel } from '#root/llm/models.js'
import { FunctionCallingMode, GoogleGenerativeAI } from '@google/generative-ai'
import { systemInstructions } from './system-instructions/index.js'

const HISTORY_SIZE = 80 // how many messages save in context
const API_KEY = config.geminiApiKey
const MODEL_NAME = 'gemini-2.0-flash-lite'

const genAI = new GoogleGenerativeAI(API_KEY)

export const llm: LLM = {
  history: [],
  systemInstructions,
  chatModel,
  generateContent,
  generateChatContent,
  updateSystemPrompt,
  clearHistory: () => { llm.history = [] },
  addContent: (content: Content) => llm.history.push(content),
  addTextContent: (role: Role, text: string) => llm.history.push({ role, parts: [{ text }] }),
}

function updateSystemPrompt(systemInstruction: string) {
  const oldModel = llm.chatModel
  llm.chatModel = genAI.getGenerativeModel({
    systemInstruction,
    model: MODEL_NAME,
    generationConfig: oldModel.generationConfig,
    safetySettings: oldModel.safetySettings,
  })
}

function generateChatContent() {
  return llm.chatModel.generateContent({
    contents: llm.history.slice(-HISTORY_SIZE),
  })
}

async function generateContent(content?: Content) {
  if (content !== undefined)
    llm.history.push(content)
  const result = await llm.chatModel.generateContent({
    contents: llm.history.slice(-HISTORY_SIZE),
    toolConfig: {
      functionCallingConfig: {
        mode: FunctionCallingMode.NONE,
      },
    },
  })
  const resultMessage = result.response.text().replace(/\s{2,}/g, ' ')
  llm.addTextContent('model', resultMessage)
  return resultMessage
}

export interface LLM {
  chatModel: GenerativeModel
  history: Content[]
  systemInstructions: Record<string, string>
  updateSystemPrompt: (systemInstruction: string) => void
  clearHistory: () => void
  addContent: (content: Content) => void
  generateContent: (content?: Content) => Promise<string>
  generateChatContent: () => Promise<GenerateContentResult>
  addTextContent: (role: Role, text: string) => void
}

type Role = 'user' | 'model'
