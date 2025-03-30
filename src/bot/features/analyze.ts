import type { Context } from '#root/bot/context.js'
import { isChatAllowed } from '#root/bot/filters/is-chat-allowed.js'
import { logHandle } from '#root/bot/helpers/logging.js'
import { llm } from '#root/llm/index.js'
import { paradex } from '#root/paradex/index.js'
import { chatAction } from '@grammyjs/auto-chat-action'
import { Composer } from 'grammy'

const composer = new Composer<Context>()
const future = composer.chatType(['group', 'supergroup']).filter(isChatAllowed)

future.command(
  'analyze',
  logHandle('command-analyze'),
  chatAction('typing'),
  async (ctx) => {
    let marketData: string = ''
    const text = ctx.match.trim()
    if (!text)
      return ctx.reply('Write token and comment (optional). Example: /analyze SOL long or short')

    const { token, comment } = splitTokenAndComment(text)
    const tokens = await paradex.helpers.getMarketsBaseTokens()
    if (!tokens.includes(token))
      return ctx.reply('There is no such token on Paradex, or the command was used incorrectly. Please write token correct, for example SOL or kPEPE')

    ctx.reply('Collecting data from the market, please wait a bit...', {
      reply_parameters: { message_id: ctx.msg.message_id },
    })

    try {
      marketData = await paradex.analyze(`${token}-USD-PERP`)
    }
    catch {
      return ctx.reply('An error occurred while collecting data', {
        reply_parameters: { message_id: ctx.msg.message_id },
      })
    }

    ctx.logger.debug(token)
    ctx.logger.debug(comment)
    ctx.logger.debug(marketData)

    const response = await llm.analyzeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: `${comment}\n${marketData}` }] }],
    })
    const resultMessage = response.response.text()
    return ctx.reply(resultMessage, {
      reply_parameters: { message_id: ctx.msg.message_id },
    })
  },
)

function splitTokenAndComment(input: string) {
  // Find the first space which separates token from comment
  const firstSpaceIndex = input.indexOf(' ')
  // If there's no space, the entire string is a token with no comment
  if (firstSpaceIndex === -1) {
    return {
      token: input,
      comment: '',
    }
  }

  // Split the string at the first space
  const token = input.substring(0, firstSpaceIndex)
  const comment = input.substring(firstSpaceIndex + 1)
  return {
    token,
    comment,
  }
}

export { composer as analyzeFuture }
