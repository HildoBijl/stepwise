// Find the earliest occurrence of any character at or after startIndex. Return -1 when none are found.
export function indexOfAnyCharacter(value: string, characters: readonly string[], startIndex = 0): number {
	if (characters.some(character => Array.from(character).length !== 1)) throw new TypeError('indexOfAnyCharacter: every search value must contain exactly one character.')
	startIndex = ensureInteger(startIndex)

	// Check edge cases.
	if (startIndex < 0) startIndex = 0
	if (startIndex >= value.length || characters.length === 0) return -1

	// Return the index of the first matching character.
	for (let index = startIndex; index < value.length; index++) {
		if (characters.some(character => value.startsWith(character, index))) return index
	}

	// No symbol is found.
	return -1
}
import { ensureInteger } from '../numbers'
