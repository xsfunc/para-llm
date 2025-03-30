import type { Context } from '#root/bot/context.js'
import type { LLM } from '#root/llm/index.js'
import type { Middleware } from 'grammy'
import { formatMessage } from '#root/bot/helpers/formatting.js'

export function saveChatHistory(llm: LLM): Middleware<Context> {
  return async (ctx, next) => {
    let messageText = ''

    if (ctx.has('message:text')) {
      messageText = ctx.message.text
    }
    else if (ctx.has('message:photo')) {
      const imageDescription = '[photo]'
      messageText = ctx.message.caption
        ? `${ctx.message.caption} ${imageDescription}`
        : imageDescription
    }
    else if (ctx.has('message:video')) {
      messageText = ctx.message.caption
        ? `${ctx.message.caption} [video]`
        : '[video]'
    }
    else if (ctx.has('message:audio')) {
      messageText = ctx.message.caption
        ? `${ctx.message.caption} [audio]`
        : '[audio]'
    }
    else if (ctx.has('message:voice')) {
      messageText = ctx.message.caption
        ? `${ctx.message.caption} [voice]`
        : '[voice]'
    }
    else if (ctx.has('message:sticker')) {
      messageText = '[sticker]'
    }
    else {
      return next()
    }

    const textContent = formatMessage({
      message: messageText,
      messageId: ctx.message.message_id,
      date: ctx.message.date,
      userId: ctx.from.id,
      username: ctx.from.username,
      name: ctx.from.first_name,
      replyMessageId: ctx.message.reply_to_message?.message_id,
      replacementUsername: ctx.config.replacementUsername,
      replacementName: ctx.config.replacementName,
    })

    llm.addTextContent('user', textContent)
    return next()
  }
}
