import { config } from '#root/config.js'

export function getFileUrl(filePath: string) {
  return `https://api.telegram.org/file/bot${config.botToken}/${filePath}`
}
