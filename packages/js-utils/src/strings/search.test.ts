import { describe, expect, it } from 'vitest'

import { indexOfAnyCharacter } from './search.ts'

describe('string searching', () => {
	it('finds the earliest requested character', () => {
		expect(indexOfAnyCharacter('abcde', ['d', 'b'])).toBe(1)
		expect(indexOfAnyCharacter('abcde', ['b'], 2)).toBe(-1)
		expect(indexOfAnyCharacter('abc', ['a'], -3)).toBe(0)
	})

	it('handles empty and Unicode searches', () => {
		expect(indexOfAnyCharacter('abc', [])).toBe(-1)
		expect(indexOfAnyCharacter('a😀b', ['😀'])).toBe(1)
		expect(() => indexOfAnyCharacter('abc', ['ab'])).toThrow(TypeError)
	})
})
