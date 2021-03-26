function ensureDate(input) {
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
module.exports.ensureDate = ensureDate

function isValidDate(date) {
	if (date.constructor !== Date)
		return false
	return !isNaN(date.getTime())
}
module.exports.isValidDate = isValidDate

function formatDate(date) {
	date = ensureDate(date)
	const ensureTwoDigits = (x) => x < 10 ? `0${x}` : x
	const year = date.getFullYear()
	const month = ensureTwoDigits(date.getMonth() + 1)
	const day = ensureTwoDigits(date.getDate())
	return `${year}-${month}-${day}`
}
module.exports.formatDate = formatDate