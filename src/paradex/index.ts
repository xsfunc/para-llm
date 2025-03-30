import { analyze } from '#root/paradex/analyze.js'
import { getMarketsBaseTokens } from '#root/paradex/api-helpers.js'
import { api } from './api.js'

export const paradex = {
  api,
  analyze,
  helpers: {
    getMarketsBaseTokens,
  },
}
