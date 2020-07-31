// removeAtIndex takes a string and removes the character at the given index. The new string is returned.
function removeAtIndex(str, ind, len = 1) {
	return str.slice(0, ind) + str.slice(ind + len)
}
module.exports.removeAtIndex = removeAtIndex

// insertAtIndex takes a string and inserts another string at the given index.
function insertAtIndex(str, insertion = '', ind = 0) {
	return str.slice(0, ind) + insertion + str.slice(ind)
}
module.exports.insertAtIndex = insertAtIndex

// isLetter checks if a character is a letter.
const letterRegExp = /[a-z]/i
function isLetter(str) {
	return str.length === 1 && str.match(letterRegExp)
}
module.exports.isLetter = isLetter

// JSONstringifyWithoutPropertyQuotes will JSON stringify an object but not like {"x":"a"}. Instead, it will give {x:"a"}. No quotes will be used around properties.
function JSONstringifyWithoutPropertyQuotes(obj) {
	// If it's not an object, use the regular JSON.stringify.
	if (typeof obj !== "object" || Array.isArray(obj))
		return JSON.stringify(obj)

	// Merge all properties together into a JSON string.
	return `{${Object.keys(obj).map(key => `${key}:${JSONstringifyWithoutPropertyQuotes(obj[key])}`).join(',')}}`
}
module.exports.JSONstringifyWithoutPropertyQuotes = JSONstringifyWithoutPropertyQuotes
