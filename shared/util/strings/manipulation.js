const { ensureString } = require('./checks')

// lowerFirst makes sure the first character of the given string is in lower case.
function lowerFirst(str) {
	str = ensureString(str)
	return str && `${str[0].toLowerCase()}${str.slice(1)}`
}
module.exports.lowerFirst = lowerFirst

// upperFirst makes sure the first character of the given string is in upper case.
function upperFirst(str) {
	str = ensureString(str)
	return str && `${str[0].toUpperCase()}${str.slice(1)}`
}
module.exports.upperFirst = upperFirst

// removeWhitespace removes all whitespace from a string.
function removeWhitespace(str) {
	return str.replace(/\s/g, "")
}
module.exports.removeWhitespace = removeWhitespace

// removeAt takes a string and removes the character at the given index. The new string is returned.
function removeAt(str, ind, len = 1) {
	return str.slice(0, ind) + str.slice(ind + len)
}
module.exports.removeAt = removeAt

// insertAt takes a string and inserts another string at the given index.
function insertAt(str, ind = 0, insertion = '') {
	return str.slice(0, ind) + insertion + str.slice(ind)
}
module.exports.insertAt = insertAt

// camelToKebab takes a string like 'someFancyName' and turns it into 'some-fancy-name': all lower case and with dashes as seperators.
function camelToKebab(str) {
	return lowerFirst(str).replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
}
module.exports.camelToKebab = camelToKebab