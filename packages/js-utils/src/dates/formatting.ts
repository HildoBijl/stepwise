import { ensureDate } from './checks'

// Format a Date as "YYYY-MM-DD". Optionally include "HH:mm" or "HH:mm:ss".
export function formatDate(date: Date, includeTime: boolean = false, includeSeconds: boolean = false): string {
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
