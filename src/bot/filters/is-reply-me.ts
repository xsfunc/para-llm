import type { Context } from '#root/bot/context.js'

export function isReplyMe(ctx: Context) {
  const msg = ctx.message
  if (msg?.reply_to_message)
    return msg.reply_to_message.from?.id === ctx.me.id
  return false
}
