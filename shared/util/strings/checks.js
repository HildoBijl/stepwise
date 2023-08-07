// ensureString takes a parameter and makes sure it's a string. If not, it throws an error. If the second parameter (nonEmpty) is set to true, it must also be non-empty.
function ensureString(str, nonEmpty = false) {
	if (typeof str !== 'string')
		throw new Error(`Invalid parameter: expected a string but received "${JSON.stringify(str)}".`)
	if (nonEmpty && str === '')
		throw new Error(`Invalid parameter: expected a non-empty string but received an empty one.`)
	return str
}
module.exports.ensureString = ensureString

// alphabet is simply the English alphabet.
const alphabet = 'abcdefghijklmnopqrstuvwxyz'
module.exports.alphabet = alphabet

// isLetter checks if a character is a letter. This includes Greek letters.
const letterRegExp = /[a-zα-ω]/i
function isLetter(str) {
	return !!(typeof str === 'string' && str.length === 1 && str.match(letterRegExp))
}
module.exports.isLetter = isLetter
