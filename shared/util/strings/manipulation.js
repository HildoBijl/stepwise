const { ensureString } = require('./checks')

// firstToLowerCase makes sure the first character of the given string is in lower case.
function firstToLowerCase(str) {
	str = ensureString(str)
	return str && `${str[0].toLowerCase()}${str.slice(1)}`
}
module.exports.firstToLowerCase = firstToLowerCase

// firstToUpperCase makes sure the first character of the given string is in upper case.
function firstToUpperCase(str) {
	str = ensureString(str)
	return str && `${str[0].toUpperCase()}${str.slice(1)}`
}
module.exports.firstToUpperCase = firstToUpperCase

// removeWhitespace removes all whitespace from a string.
function removeWhitespace(str) {
	return str.replace(/\s/g, "")
}
module.exports.removeWhitespace = removeWhitespace

// removeAtIndex takes a string and removes the character at the given index. The new string is returned.
function removeAtIndex(str, ind, len = 1) {
	return str.slice(0, ind) + str.slice(ind + len)
}
module.exports.removeAtIndex = removeAtIndex

// insertAtIndex takes a string and inserts another string at the given index.
function insertAtIndex(str, ind = 0, insertion = '') {
	return str.slice(0, ind) + insertion + str.slice(ind)
}
module.exports.insertAtIndex = insertAtIndex
