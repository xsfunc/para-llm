import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const chatFilePath = path.join(__dirname, 'chat.txt')
const chatSystemInstruction = fs.readFileSync(chatFilePath, 'utf8')
const analyzeFilePath = path.join(__dirname, 'analyze.txt')
const analyzeSystemInstruction = fs.readFileSync(analyzeFilePath, 'utf8')

export const systemInstructions = {
  chat: chatSystemInstruction,
  analyze: analyzeSystemInstruction,
}
