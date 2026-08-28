import { ensureInteger } from '../numbers/index.ts'

// The English alphabet.
export const alphabet = 'abcdefghijklmnopqrstuvwxyz'

// Get a lowercase spreadsheet column label from a positive integer (1 -> 'a', 26 -> 'z', 27 -> 'aa').
export function getSpreadsheetColumnLabel(n: number): string {
	n = ensureInteger(n, { nonNegative: true })
	if (n === 0) return ''

	// Prepare list for characters.
	let parts: string[] = []
	const base = alphabet.length

	// Iterate: find the last character, and reduce n accordingly.
	while (n > 0) {
		const idx = (n - 1) % base
		parts.push(alphabet[idx])
		n = (n - idx - 1) / base
	}

	// Reverse the parts list for the correct order.
	return parts.reverse().join('')
}
