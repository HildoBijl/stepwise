// removeAtIndex takes a string and removes the character at the given index. The new string is returned.
export function removeAtIndex(str, ind, len = 1) {
	return str.slice(0, ind) + str.slice(ind + len)
}

// insertAtIndex takes a string and inserts another string at the given index.
export function insertAtIndex(str, ind = 0, insertion = '') {
	return str.slice(0, ind) + insertion + str.slice(ind)
}

// stringSplice removes a certain number of characters from a string and adds a new substring in its place.
export function stringSplice(str, index, numCharsToRemove = 0, insertion = '') {
	return str.slice(0, ind) + insertion + str.slice(ind + numCharsToRemove)
}

// isLetter checks if a character is a letter. This includes Greek letters.
const letterRegExp = /[a-zα-ω]/i
export function isLetter(str) {
	return !!(typeof str === 'string' && str.length === 1 && str.match(letterRegExp))
}

// JSONstringifyWithoutPropertyQuotes will JSON stringify an object but not like {"x":"a"}. Instead, it will give {x:"a"}. No quotes will be used around properties.
export function JSONstringifyWithoutPropertyQuotes(obj) {
	// If it's not an object, use the regular JSON.stringify.
	if (typeof obj !== "object" || Array.isArray(obj))
		return JSON.stringify(obj)

	// Merge all properties together into a JSON string.
	return `{${Object.keys(obj).map(key => `${key}:${JSONstringifyWithoutPropertyQuotes(obj[key])}`).join(',')}}`
}

// allIndicesOf returns an array of all the indices for a certain character in a string.
export function allIndicesOf(str, symbol) {
	const res = []
	let index
	while (index !== -1) {
		index = str.indexOf(symbol, index === undefined ? 0 : index + 1)
		if (index !== -1)
			res.push(index)
	}
	return res
}

// getNextSymbol takes a string and an array of symbols and finds the first occurrence of one of these symbols. Optionally, a startFrom can be added to start searching from this index. The result will be greater or equal than this number. Returns -1 if none of the symbols are found.
export function getNextSymbol(str, symbols, startFrom = 0) {
	return symbols.reduce((result, symbol) => {
		const nextOccurrence = str.indexOf(symbol, startFrom)
		if (nextOccurrence === -1)
			return result
		if (result === -1)
			return nextOccurrence
		return Math.min(result, nextOccurrence)
	}, -1)
}
