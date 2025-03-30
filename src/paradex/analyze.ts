import { api } from '#root/paradex/api.js'
import { json2csv } from 'json-2-csv'
import { filterFundingByMinutes, formatKlines, klinesWithPeriod } from './api-helpers.js'
import { hhMMFormat, hoursAgo, minutesAgo, now, timeOnlyFormat, unixTimestampToDate } from './helpers.js'

const orderbookCsvColumns = {
  keys: [
    {
      field: '0',
      title: 'price',
    },
    {
      field: '1',
      title: 'size',
    },
  ],
}

export async function analyze(market: string) {
  const bbo = await api.getBBO(market)
  let data = `${bbo.market}\n`
  data += ('\nbest bid/ask: ')
  data += (`${bbo.bid} (size: ${bbo.bid_size})/${bbo.ask} (size: ${bbo.ask_size})`)

  const { asks, bids } = await api.getOrderbook({ market, depth: 10 })
  data += ('\nOrderbook asks (CSV):')
  data += (json2csv(asks, orderbookCsvColumns))
  data += ('Orderbook bids (CSV):')
  data += (json2csv(bids, orderbookCsvColumns))

  const klinesWeek = await klinesWithPeriod({
    market,
    period: 'week',
  })
  data += ('\nLast week 1H OHLCV CSV:')
  const formattedKlinesWeek = formatKlines(klinesWeek)
  const csvKlinesWeek = json2csv(formattedKlinesWeek)
  data += (csvKlinesWeek)

  const klinesDay = await klinesWithPeriod({
    market,
    period: 'day',
  })
  data += ('\nLast day, 30m OHLCV CSV:')
  const formattedKlinesDay = formatKlines(klinesDay)
  const csvKlinesDay = json2csv(formattedKlinesDay)
  data += (csvKlinesDay)

  const klinesHour = await klinesWithPeriod({
    market,
    period: 'hour',
  })
  data += ('\nLast hour, 5m OHLCV CSV:')
  const formattedKlinesHour = formatKlines(klinesHour)
  const csvKlinesHour = json2csv(formattedKlinesHour)
  data += (csvKlinesHour)

  const klines30min = await api.getKlines({ symbol: market, start_at: minutesAgo(30), end_at: now(), resolution: '1' })
  data += ('\nLast 30min, 1m OHLCV CSV:')
  const formattedKlines30min = formatKlines(klines30min)
  const csvKlines30min = json2csv(formattedKlines30min)
  data += (csvKlines30min)

  const tradesHour = await api.getTrades({
    market,
    start_at: hoursAgo(),
    end_at: now(),
    page_size: 500,
  })
  const formattedTrades = tradesHour.results.map(trade => ({
    side: trade.side.toLowerCase() === 'buy' ? 'B' : 'S',
    size: trade.size,
    price: trade.price,
    liquidation: trade.trade_type === 'FILL' ? '' : true,
    time: unixTimestampToDate(trade.created_at, timeOnlyFormat),
  }))
  const tradesCsv = json2csv(formattedTrades)
  data += ('\nTrades for hour CSV:')
  data += (tradesCsv)

  const funding = await api.getFunding({ market, start_at: hoursAgo(1), end_at: now(), page_size: 200 })
  const filteredFunding = filterFundingByMinutes(funding, 1)
  const formattedFunding = filteredFunding.map(f => ({
    rate: Number(f.funding_rate).toFixed(6),
    time: unixTimestampToDate(f.created_at, hhMMFormat),
  }))
  const fundingCSV = json2csv(formattedFunding)
  data += ('\nFunding CSV:')
  data += (fundingCSV)

  return data
}
