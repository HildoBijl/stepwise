const { ensureDate } = require('./checks')

// formatDate turns a Date object into a string of the form "YYYY-MM-DD". If includeTime is set to true, als "HH:mm" is included, and if includeSeconds is set to true this becomes "HH:mm:ss". There is always a two-digit format used.
function formatDate(date, includeTime = false, includeSeconds = false) {
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
module.exports.formatDate = formatDate
