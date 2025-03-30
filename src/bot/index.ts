import type { Context } from '#root/bot/context.js'
import type { Config } from '#root/config.js'
import type { Logger } from '#root/logger.js'
import type { BotConfig } from 'grammy'
import { adminFeature } from '#root/bot/features/admin.js'
import { analyzeFuture } from '#root/bot/features/analyze.js'
import { chatWithLLMFeature } from '#root/bot/features/chat-with-llm.js'
import { unhandledFeature } from '#root/bot/features/unhandled.js'
import { errorHandler } from '#root/bot/handlers/error.js'
import { i18n } from '#root/bot/i18n.js'
import { session } from '#root/bot/middlewares/session.js'
import { updateLogger } from '#root/bot/middlewares/update-logger.js'
import { autoChatAction } from '@grammyjs/auto-chat-action'
import { hydrate } from '@grammyjs/hydrate'
import { hydrateReply, parseMode } from '@grammyjs/parse-mode'
import { sequentialize } from '@grammyjs/runner'
import { MemorySessionStorage, Bot as TelegramBot } from 'grammy'

interface Dependencies {
  config: Config
  logger: Logger
}

function getSessionKey(ctx: Omit<Context, 'session'>) {
  return ctx.chat?.id.toString()
}

export function createBot(token: string, dependencies: Dependencies, botConfig?: BotConfig<Context>) {
  const {
    config,
    logger,
  } = dependencies

  const bot = new TelegramBot<Context>(token, botConfig)

  bot.use(async (ctx, next) => {
    ctx.config = config
    ctx.logger = logger.child({
      update_id: ctx.update.update_id,
    })

    await next()
  })

  const protectedBot = bot.errorBoundary(errorHandler)

  // Middlewares
  bot.api.config.use(parseMode('HTML'))

  if (config.isPollingMode)
    protectedBot.use(sequentialize(getSessionKey))
  if (config.isDebug)
    protectedBot.use(updateLogger())
  protectedBot.use(autoChatAction(bot.api))
  protectedBot.use(hydrateReply)
  protectedBot.use(hydrate())
  protectedBot.use(session({
    getSessionKey,
    storage: new MemorySessionStorage(),
  }))
  protectedBot.use(i18n)

  // Handlers
  protectedBot.use(adminFeature)
  protectedBot.use(analyzeFuture)
  protectedBot.use(chatWithLLMFeature)
  // must be the last handler
  protectedBot.use(unhandledFeature)

  return bot
}

export type Bot = ReturnType<typeof createBot>
