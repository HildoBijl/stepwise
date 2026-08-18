import { ensureDate } from './checks'

export type FormatDateOptions = {
	includeTime?: boolean
	includeSeconds?: boolean
}

// Format a Date as "YYYY-MM-DD". Optionally include "HH:mm" or "HH:mm:ss".
export function formatDate(date: Date, options: FormatDateOptions = {}): string {
	const { includeTime = false, includeSeconds = false } = options
	date = ensureDate(date)
	const twoDigit = (x: number) => x < 10 ? `0${x}` : `${x}`

	const year = date.getFullYear()
	const month = twoDigit(date.getMonth() + 1)
	const day = twoDigit(date.getDate())
	const formattedDate = `${year}-${month}-${day}`
	if (!includeTime)
		return formattedDate

	const hours = twoDigit(date.getHours())
	const minutes = twoDigit(date.getMinutes())
	const formattedDateTime = `${formattedDate} ${hours}:${minutes}`
	if (!includeSeconds)
		return formattedDateTime

	const seconds = twoDigit(date.getSeconds())
	return `${formattedDateTime}:${seconds}`
}
