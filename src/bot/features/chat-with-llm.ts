import type { Context } from '#root/bot/context.js'
import { isChatAllowed } from '#root/bot/filters/is-chat-allowed.js'
import { isReplyMe } from '#root/bot/filters/is-reply-me.js'
import { containsBotName } from '#root/bot/helpers/formatting.js'
import { logHandle, logLLMContext } from '#root/bot/helpers/logging.js'
import { llmHandle } from '#root/bot/middlewares/llm-handle.js'
import { saveChatHistory } from '#root/bot/middlewares/save-history.js'
import { llm } from '#root/llm/index.js'
import { Composer } from 'grammy'

const composer = new Composer<Context>()
const replyFeature = composer
  .chatType(['group', 'supergroup'])
  .filter(isChatAllowed)
  .filter(isReplyMe)
const anyMessageFeature = composer
  .chatType(['group', 'supergroup'])
  .filter(isChatAllowed)

replyFeature.on(
  ['message:text', 'message:photo', 'message:video', 'message:audio', 'message:voice', 'message:sticker'],
  logHandle('reply-me-message'),
  saveChatHistory(llm),
  llmHandle(llm),
  logLLMContext(llm),
)

anyMessageFeature.on(
  ['message:text', 'message:photo', 'message:video', 'message:audio', 'message:voice', 'message:sticker'],
  logHandle('any-message'),
  saveChatHistory(llm),
  async (ctx, next) => {
    const caption = ctx.message.text || ctx.message.caption
    if (containsBotName(caption, ctx.config.botNames))
      return next()
  },
  llmHandle(llm),
  logLLMContext(llm),
)

export { composer as chatWithLLMFeature }
