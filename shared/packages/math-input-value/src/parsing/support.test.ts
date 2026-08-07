import type { ExpressionValue } from '../types'

import { findCharacterAtZeroBracketCount, findEndOfExponent, findEndOfFactor, findNextClosingBracket, getMatchingBrackets } from './support'

describe('bracket matching', () => {
	test('finds top-level matching brackets while ignoring nested pairs', () => {
		expect(getMatchingBrackets(['(x+(y))'])).toEqual([{ opening: { part: 0, cursor: 0 }, closing: { part: 0, cursor: 6 } }])
	})

	test('finds separate top-level bracket pairs across expression parts', () => {
		const value: ExpressionValue = ['(x)', { type: 'Accent', name: 'dot', value: 'y' }, '+(z)']
		expect(getMatchingBrackets(value)).toEqual([
			{ opening: { part: 0, cursor: 0 }, closing: { part: 0, cursor: 2 } },
			{ opening: { part: 2, cursor: 1 }, closing: { part: 2, cursor: 3 } },
		])
	})

	test('treats a logarithm construct as an opening round bracket', () => {
		const value: ExpressionValue = ['', { type: 'Logarithm', base: ['2'] }, 'x+(y))']
		expect(getMatchingBrackets(value)).toEqual([{ opening: { part: 1, cursor: 0 }, closing: { part: 2, cursor: 5 } }])
		expect(findNextClosingBracket(value, { part: 0, cursor: 0 })).toEqual({ part: 2, cursor: 6 })
	})

	test('reports unmatched opening and closing brackets', () => {
		expect(() => getMatchingBrackets(['(x'])).toThrow('missing closing bracket')
		expect(() => getMatchingBrackets(['x)'])).toThrow('missing opening bracket')
	})
})

describe('zero-depth searching', () => {
	test('skips wanted characters inside brackets', () => {
		const value = ['a+(b+c)+d']
		expect(findCharacterAtZeroBracketCount(value, { part: 0, cursor: 0 }, '+')).toEqual({ part: 0, cursor: 1 })
		expect(findCharacterAtZeroBracketCount(value, { part: 0, cursor: 2 }, '+')).toEqual({ part: 0, cursor: 7 })
	})

	test('finds factor boundaries in both directions', () => {
		const value = ['a+b*c-d']
		expect(findEndOfFactor(value, { part: 0, cursor: 4 })).toEqual({ part: 0, cursor: 5 })
		expect(findEndOfFactor(value, { part: 0, cursor: 5 }, false)).toEqual({ part: 0, cursor: 4 })
	})

	test('finds the end of a numeric exponent before another power', () => {
		expect(findEndOfExponent(['x^2^3'], { part: 0, cursor: 2 })).toEqual({ part: 0, cursor: 3 })
	})
})
