const BASE_URL = 'https://api.prod.paradex.trade/v1'

function getHeaders(): Headers {
  const headers = new Headers()
  headers.append('Accept', 'application/json')
  return headers
}

/**
 * Get the best bid/ask for the given market
 * @param market - Market symbol (e.g. "BTC-USD-PERP")
 * @returns Contains best bid/ask prices, sizes, market symbol, and timestamp
 */
async function getBBO(market: string): Promise<BBOResponse> {
  const response = await fetch(`${BASE_URL}/bbo/${market}`, {
    method: 'GET',
    headers: getHeaders(),
    redirect: 'follow',
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

/**
 * Fetches trade history for a given market
 * @param params - Parameters for the trades request
 * @param params.market - Market symbol to fetch trades for (e.g. "BTC-USD-PERP")
 * @param params.cursor - Optional pagination cursor for fetching next/previous page
 * @param params.start_at - Optional start timestamp in milliseconds for filtering trades
 * @param params.end_at - Optional end timestamp in milliseconds for filtering trades
 * @param params.page_size - Optional number of trades to return per page (default: 100, max: 5000)
 * @returns Promise containing pagination cursors and trade results
 */
async function getTrades(params: {
  market: string
  cursor?: string
  start_at?: number
  end_at?: number
  page_size?: number
}): Promise<{
    next: string | null
    prev: string | null
    results: Trade[]
  }> {
  const url = new URL(`${BASE_URL}/trades`)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, String(value))
    }
  })

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getHeaders(),
    redirect: 'follow',
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

/**
 * Fetches funding data for a given market
 * @param params - Parameters for the funding data request
 * @param params.market - Market symbol to fetch funding data for (e.g. "BTC-USD-PERP")
 * @param params.cursor - Optional pagination cursor for fetching next/previous page
 * @param params.start_at - Optional start timestamp in milliseconds for filtering data
 * @param params.end_at - Optional end timestamp in milliseconds for filtering data
 * @param params.page_size - Optional number of results to return per page (default varies by API)
 * @returns Promise resolving to funding data response
 */
async function getFunding(params: {
  market: string
  cursor?: string
  start_at?: number
  end_at?: number
  page_size?: number
}): Promise<FundingResponse> {
  const url = new URL(`${BASE_URL}/funding/data`)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, String(value))
    }
  })

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getHeaders(),
    redirect: 'follow',
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

/**
 * Fetches kline/candlestick data for a given market symbol
 * @param params - Parameters for the kline request
 * @param params.symbol - Market symbol to fetch klines for (e.g. "BTC-USD")
 * @param params.end_at - End timestamp in milliseconds
 * @param params.price_kind - Optional price kind (e.g. "mark" or "index")
 * @param params.resolution - Kline resolution (e.g. "1m", "5m", "1h", "1d")
 * @param params.start_at - Start timestamp in milliseconds
 * @returns Promise resolving to kline data response
 */
async function getKlines(params: {
  symbol: string
  end_at: number
  price_kind?: string
  resolution: KlineResolution
  start_at: number
}): Promise<KlinesResponse> {
  const url = new URL(`${BASE_URL}/markets/klines`)

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value))
  })

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getHeaders(),
    redirect: 'follow',
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

interface MarketSummaryResponse {
  results: {
    ask: string
    ask_iv?: string
    bid: string
    bid_iv?: string
    created_at: number
    delta?: string
    funding_rate: string
    future_funding_rate?: string
    greeks?: {
      delta: string
      gamma: string
      vega: string
    }
    last_iv?: string
    last_traded_price: string
    mark_iv?: string
    mark_price: string
    open_interest: string
    price_change_rate_24h: string
    symbol: string
    total_volume: string
  }[]
}

async function getMarketSummary(params: {
  /** Name of the market for which summary is requested (for all available markets use ALL) */
  market: string
  /** Start Time (unix time millisecond) */
  start?: number
  /** End Time (unix time millisecond) */
  end?: number
}): Promise<MarketSummaryResponse> {
  const url = new URL(`${BASE_URL}/markets/summary`)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, String(value))
    }
  })

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getHeaders(),
    redirect: 'follow',
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

interface OrderbookResponse {
  asks: [string, string][]
  bids: [string, string][]
  last_updated_at: number
  market: string
  seq_no: number
}

/**
 * Fetches orderbook data for a given market
 * @param params - Parameters object for the orderbook request
 * @param params.market - Market symbol (e.g. "BTC-USD-PERP")
 * @param params.depth - Optional depth parameter to control number of orderbook levels returned
 * @returns Promise resolving to orderbook data response
 */
async function getOrderbook(params: {
  market: string
  depth?: number
}): Promise<OrderbookResponse> {
  const url = new URL(`${BASE_URL}/orderbook/${params.market}`)

  if (params.depth !== undefined) {
    url.searchParams.append('depth', String(params.depth))
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getHeaders(),
    redirect: 'follow',
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export const api = {
  getBBO,
  getTrades,
  getFunding,
  getKlines,
  getMarketSummary,
  getOrderbook,
}

interface BBOResponse {
  /** Symbol of the market */
  market: string
  /** Best bid price */
  bid: string
  /** Best bid size */
  bid_size: string
  /** Best ask price */
  ask: string
  /** Best ask size */
  ask_size: string
  /** Last update to the orderbook in milliseconds */
  last_updated_at: number
  /** Sequence number of the orderbook */
  seq_no: number
}

export interface KlinesResponse {
  results: [
    number, // timestamp
    number, // open
    number, // high
    number, // low
    number, // close
    number, // volume
  ][]
}

export type KlineResolution = '1' | '3' | '5' | '15' | '30' | '60'

interface Trade {
  created_at: number
  id: string
  market: string
  price: string
  side: 'buy' | 'sell'
  size: string
  trade_type: 'FILL' | 'LIQUIDATION'
}
export interface FundingResponse {
  next: string
  prev: string
  results: {
    created_at: number
    funding_index: string
    funding_premium: string
    funding_rate: string
    market: string
  }[]
}
