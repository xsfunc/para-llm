import type { Context } from '#root/bot/context.js'

export function isChatAllowed(ctx: Context) {
  if (ctx.config.useChatWhitelist === false)
    return true
  return !!ctx.chat && ctx.config.allowedChats.includes(ctx.chat.id)
}
