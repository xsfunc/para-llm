export const hhMMFormat: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false }
export const timeOnlyFormat: Intl.DateTimeFormatOptions = { ...hhMMFormat, second: '2-digit' }
export const minuteOnlyFormat: Intl.DateTimeFormatOptions = { second: '2-digit', minute: '2-digit', hour12: false }
export const dayOnlyFormat: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }

/**
 * Converts Unix timestamp to a formatted date string
 * @param {number} unixTimestamp - Unix timestamp in milliseconds
 * @param {Intl.DateTimeFormatOptions} [localTimeOptions] - Optional formatting options for date/time
 * @returns {string} Formatted date string. Default format is "MM/DD HH:mm:ss" (24-hour time) if no options provided
 */
export function unixTimestampToDate(unixTimestamp: number, localTimeOptions?: Intl.DateTimeFormatOptions): string {
  const date = new Date(unixTimestamp)
  const locale = 'en-US'

  if (localTimeOptions)
    return date.toLocaleString(locale, localTimeOptions)

  const dateStr = date.toLocaleDateString(locale, dayOnlyFormat)
  const timeStr = date.toLocaleTimeString(locale, timeOnlyFormat)
  return `${dateStr} ${timeStr}`
}

/**
 * Returns a timestamp for the specified number of days ago
 * @param {number} [days] - Number of days to go back
 * @return {number} Timestamp (milliseconds)
 */
export function daysAgo(days: number = 1): number {
  return Date.now() - (days * 24 * 60 * 60 * 1000)
}

/**
 * Returns a timestamp for the specified number of hours ago
 * @param {number} [hours] - Number of hours to go back
 * @return {number} Timestamp (milliseconds)
 */
export function hoursAgo(hours: number = 1): number {
  return Date.now() - (hours * 60 * 60 * 1000)
}

/**
 * Returns a timestamp for the specified number of minutes ago
 * @param {number} [minutes] - Number of minutes to go back
 * @return {number} Timestamp (milliseconds)
 */
export function minutesAgo(minutes: number = 1): number {
  return Date.now() - (minutes * 60 * 1000)
}

/**
 * Returns a timestamp for the specified number of seconds ago
 * @param {number} [seconds] - Number of seconds to go back
 * @return {number} Timestamp (milliseconds)
 */
export function secondsAgo(seconds: number = 1): number {
  return Date.now() - (seconds * 1000)
}

/**
 * Returns a Date object for the specified number of days ago
 * @param {number} days - Number of days to go back
 * @return {Date} Date object
 */
export function getDateDaysAgo(days: number): Date {
  return new Date(daysAgo(days))
}

/**
 * Returns a Date object for the specified number of hours ago
 * @param {number} hours - Number of hours to go back
 * @return {Date} Date object
 */
export function getDateHoursAgo(hours: number): Date {
  return new Date(hoursAgo(hours))
}

/**
 * Returns a Date object for the specified number of minutes ago
 * @param {number} minutes - Number of minutes to go back
 * @return {Date} Date object
 */
export function getDateMinutesAgo(minutes: number): Date {
  return new Date(minutesAgo(minutes))
}

/**
 * Returns the current timestamp in milliseconds
 * @return {number} Current timestamp (milliseconds)
 */
export function now(): number {
  return Date.now()
}
