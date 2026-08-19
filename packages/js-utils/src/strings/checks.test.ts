import { describe, expect, it } from 'vitest'

import { ensureString, isLetter } from './checks'

describe('string checks', () => {
	it('ensures strings and optional non-emptiness', () => {
		expect(ensureString('')).toBe('')
		expect(ensureString('text', { nonEmpty: true })).toBe('text')
		expect(() => ensureString(1)).toThrow(TypeError)
		expect(() => ensureString('', { nonEmpty: true })).toThrow(RangeError)
	})

	it('recognizes one Unicode letter', () => {
		expect(isLetter('A')).toBe(true)
		expect(isLetter('é')).toBe(true)
		expect(isLetter('字')).toBe(true)
		expect(isLetter('ab')).toBe(false)
		expect(isLetter('1')).toBe(false)
	})
})
