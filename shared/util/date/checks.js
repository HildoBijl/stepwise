function isDate(date) {
	if (!date || date.constructor !== Date)
		return false
	return !isNaN(date.getTime())
}
module.exports.isDate = isDate

function ensureDate(input) {
	// Check if it's already a date object.
	if (input.constructor === Date)
		return input

	// Try to force it into one.
	const date = new Date(input)
	if (isDate(date))
		return date

	// Nothing worked.
	throw new Error(`Invalid date encountered: received "${input}" which could not be converted into a date.`)
}
module.exports.ensureDate = ensureDate
