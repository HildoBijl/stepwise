// Find the earliest occurrence of any symbol in "symbols" at or after "startFrom". Return -1 when none are found.
export function findNextOf(str: string, symbols: string[], startFrom = 0): number {
	// Check edge cases.
	if (startFrom < 0) startFrom = 0
	if (startFrom >= str.length || symbols.length === 0) return -1

	// Return the first symbol that is found.
	const symbolSet = new Set(symbols)
	for (let i = startFrom; i < str.length; i++) {
		if (symbolSet.has(str[i])) return i
	}

	// No symbol is found.
	return -1
}
