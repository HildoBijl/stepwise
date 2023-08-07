// getNextSymbol takes a string and an array of symbols and finds the first occurrence of one of these symbols. Optionally, a startFrom can be added to start searching from this index. The result will be greater or equal than this number. Returns -1 if none of the symbols are found.
function getNextSymbol(str, symbols, startFrom = 0) {
	return symbols.reduce((result, symbol) => {
		const nextOccurrence = str.indexOf(symbol, startFrom)
		if (nextOccurrence === -1)
			return result
		if (result === -1)
			return nextOccurrence
		return Math.min(result, nextOccurrence)
	}, -1)
}
module.exports.getNextSymbol = getNextSymbol
