import { ensureInt } from '../numbers'

// The English alphabet.
export const alphabet = 'abcdefghijklmnopqrstuvwxyz'

// Convert a positive integer to an alphabet string (1 -> 'a', 26 -> 'z', 27 -> 'aa').
export function toExcelColumn(n: number): string {
	n = ensureInt(n, true) // Require positive integer or zero.

	// Boundary case.
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
