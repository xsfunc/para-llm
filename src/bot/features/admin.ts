import type { Context } from '#root/bot/context.js'
import { isAdmin } from '#root/bot/filters/is-admin.js'
import { logHandle } from '#root/bot/helpers/logging.js'
import { llm } from '#root/llm/index.js'
import { chatAction } from '@grammyjs/auto-chat-action'
import { Composer } from 'grammy'

const composer = new Composer<Context>()
const feature = composer
  .chatType('private')
  .filter(isAdmin)

feature.command('start', logHandle('command-start'), (ctx) => {
  return ctx.reply('Welcome!')
})

feature.command(
  'announce',
  logHandle('announce-command'),
  chatAction('typing'),
  async (ctx) => {
    const [chatId, ...messageParts] = ctx.match.split(' ')
    if (!chatId || messageParts.length === 0) {
      return ctx.reply(
        'Usage: /announce [chat_id] [message]\n'
        + 'Example: /announce 123456789 Hello there!',
      )
    }

    const message = messageParts.join(' ')

    try {
      const numericChatId = Number(chatId)
      if (Number.isNaN(numericChatId)) {
        return ctx.reply('Chat id must be a valid numeric value')
      }

      await ctx.api.sendMessage(chatId, message)
      return ctx.reply('Message sent successfully!')
    }
    catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Unknown error'

      return ctx.reply(`❌ Error sending message: ${errorMessage}`)
    }
  },
)

feature.command(
  'clear_history',
  logHandle('clear_history'),
  chatAction('typing'),
  (ctx) => {
    llm.clearHistory()
    return ctx.reply('Chat history cleared.')
  },
)

export { composer as adminFeature }
