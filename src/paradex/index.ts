import { getMarketsBaseTokens } from '#root/paradex/api-helpers.js'
import { api } from './api.js'

export const paradex = {
  api,
  helpers: {
    getMarketsBaseTokens,
  },
}
