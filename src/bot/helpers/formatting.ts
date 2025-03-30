/**
 * Removes message_id and [reply:<number>] fragment from the start of the string if they exist.
 */
export function removeMessageIdAndReply(output: string) {
  return output
    .replace(/^\[\d+\]:\s*/, '')
    .replace(/\[reply:\d+\](:)?/g, '')
    .trim()
}

/**
 * Checks if a given caption contains any of the bot names from the provided array.
 * The function matches bot names with or without @ prefix and considers word boundaries and punctuation.
 * The matching is case-insensitive.
 *
 * @param caption - The text string to check for bot names
 * @param botNames - Array of bot names to look for in the caption
 * @returns boolean - True if any bot name is found in the caption, false otherwise
 */
export function containsBotName(caption: string | undefined, botNames: string[]) {
  if (!caption)
    return false

  return botNames.some((name) => {
    const escapedName = name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
    const wordBoundaryPattern = new RegExp(`(?:^|\\s)@?${escapedName}(?:$|\\s|\\p{P})`, 'iu')
    return wordBoundaryPattern.test(caption.toLowerCase())
  })
}

export function formatMessage(update: MessageUpdate) {
  let formattedUsername = ''
  let formattedName = ''
  if (update.username === 'Channel_Bot' && !!update.replacementUsername) {
    formattedUsername = `(@${update.replacementUsername})`
    formattedName = update.replacementName || ''
  }
  else {
    formattedUsername = update.username ? `(@${update.username})` : ''
    formattedName = update.name || ''
  }

  const dateObject = new Date(update.date * 1000)
  const formattedReplyMessageId = update.replyMessageId ? ` [reply:${update.replyMessageId}]` : ''
  const formattedDate = dateObject.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
  return `[${update.messageId}][${formattedDate}][${update.userId}] ${formattedName} ${formattedUsername}:${formattedReplyMessageId} ${update.message}`
}

interface MessageUpdate {
  messageId: number
  username?: string
  replacementUsername?: string
  name?: string
  replacementName?: string
  userId: number
  message: string
  date: number
  replyMessageId?: number
}
