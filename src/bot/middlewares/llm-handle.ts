import type { Context } from '#root/bot/context.js'
import type { LLM } from '#root/llm/index.js'
import type { FunctionCall } from '@google/generative-ai'
import type { Middleware } from 'grammy'
import { removeMessageIdAndReply } from '#root/bot/helpers/formatting.js'

export function llmHandle(llm: LLM): Middleware<Context> {
  return async (ctx, next) => {
    if (!ctx.has('message'))
      return next()

    let resultMessage = ''
    const result = await llm.generateChatContent()
    const functionCalls = result.response.functionCalls() ?? []
    const functionCall = functionCalls.at(0)
    const functionHandlers: FunctionHandlers = {}

    // if there is a function call, handle it
    if (functionCall !== undefined) {
      const functionCallResult = await functionHandlers[functionCall.name](functionCall)

      llm.history.push(result.response.candidates![0].content)
      llm.history.push({
        role: 'model',
        parts: [{
          functionResponse: {
            name: functionCall.name,
            response: {
              name: functionCall.name,
              content: {
                result: functionCallResult,
              },
            },
          },
        }],
      })

      const functionResponseResult = await llm.generateChatContent()
      resultMessage = functionResponseResult.response.text()
    }
    else {
      resultMessage = result.response.text()
    }

    if (resultMessage.length === 0)
      return next()

    const userMessageIdReplyAttachment = `[reply:${ctx.message.message_id}] `
    const messageWithoutMessageIdAndReply = removeMessageIdAndReply(resultMessage)
    const replyResult = await ctx.reply(messageWithoutMessageIdAndReply, {
      reply_parameters: { message_id: ctx.message.message_id },
    })

    llm.addTextContent('model', `[${replyResult.message_id}]: ${userMessageIdReplyAttachment}${messageWithoutMessageIdAndReply}`)
    return next()
  }
}

type FunctionHandlers = {
  [K in string]: (call: FunctionCall) => Promise<object>;
}
