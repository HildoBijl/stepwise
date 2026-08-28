import { describe, expect, it } from 'vitest'

import { camelToKebab, insertAt, lowerFirst, removeAt, removeWhitespace, upperFirst } from './manipulation.ts'

describe('string manipulation', () => {
	it('changes the first character case', () => {
		expect(lowerFirst('Hello')).toBe('hello')
		expect(upperFirst('hello')).toBe('Hello')
		expect(lowerFirst('')).toBe('')
	})

	it('removes whitespace and character ranges', () => {
		expect(removeWhitespace(' a\n b\t')).toBe('ab')
		expect(removeAt('abcdef', 2, 2)).toBe('abef')
		expect(removeAt('abc', 1, 0)).toBe('abc')
	})

	it('inserts text and converts camel case', () => {
		expect(insertAt('ac', 1, 'b')).toBe('abc')
		expect(camelToKebab('camelCaseValue')).toBe('camel-case-value')
		expect(camelToKebab('URLValue')).toBe('u-r-l-value')
	})
})
