import type { FundingResponse, KlineResolution, KlinesResponse } from './api.js'
import { api } from './api.js'
import { daysAgo, hoursAgo, now, unixTimestampToDate } from './helpers.js'

type KlinesPeriod = 'mouth' | 'week' | 'day' | 'hour'

interface KlinesParams {
  market: string
  period: KlinesPeriod
  resolution?: KlineResolution
}

export async function klinesWithPeriod({
  market,
  period,
  resolution,
}: KlinesParams) {
  const periods = {
    mouth: (resolution: KlineResolution = '60') => ({
      start_at: daysAgo(30),
      end_at: now(),
      resolution,
    }),
    week: (resolution: KlineResolution = '60') => ({
      start_at: daysAgo(7),
      end_at: now(),
      resolution,
    }),
    day: (resolution: KlineResolution = '30') => ({
      start_at: daysAgo(1),
      end_at: now(),
      resolution,
    }),
    hour: (resolution: KlineResolution = '5') => ({
      start_at: hoursAgo(1),
      end_at: now(),
      resolution,
    }),
  } as const

  const params = periods[period](resolution)
  return api.getKlines({
    symbol: market,
    ...params,
  })
}

export function formatKlines(klines: KlinesResponse) {
  return klines.results.map(([unixTime, o, h, l, c, v]) => ({
    o,
    h,
    l,
    c,
    v,
    date: unixTimestampToDate(unixTime),
  }))
}

export function filterFundingByMinutes(funding: FundingResponse, minutes: number = 5) {
  const fiveMinutesInMs = minutes * 60 * 1000
  return funding.results.filter((entry) => {
    // Get the timestamp modulo 5 minutes
    return entry.created_at % fiveMinutesInMs < 5000 // Allow 5 second window to catch entries close to the 5-min mark
  })
}
