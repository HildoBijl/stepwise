export function ensureDate(input) {
	// Check if it's already a date object.
	if (input.constructor === Date)
		return input

	// Try to force it into one.
	date = new Date(input)
	if (isValidDate(date))
		return date

	// Nothing worked.
	throw new Error(`Invalid date encountered: received "${input}" which could not be converted into a date.`)
}

export function isValidDate(date) {
	if (date.constructor !== Date)
		return false
	return !isNaN(date.getTime())
}

export function formatDate(date, includeTime = false, includeSeconds = false) {
	// Determine the day format.
	date = ensureDate(date)
	const ensureTwoDigits = (x) => x < 10 ? `0${x}` : x
	const year = date.getFullYear()
	const month = ensureTwoDigits(date.getMonth() + 1)
	const day = ensureTwoDigits(date.getDate())
	const dateFormat = `${year}-${month}-${day}`
	if (!includeTime)
		return dateFormat

	// Include the time format.
	const hours = ensureTwoDigits(date.getHours())
	const minutes = ensureTwoDigits(date.getMinutes())
	const dateTimeFormat = `${dateFormat} ${hours}:${minutes}`
	if (!includeSeconds)
		return dateTimeFormat

	// Include the seconds.
	const seconds = ensureTwoDigits(date.getSeconds())
	return `${dateTimeFormat}:${seconds}`
}
