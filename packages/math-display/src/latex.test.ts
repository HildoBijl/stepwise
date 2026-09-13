import { describe, expect, it } from 'vitest'

import { prepareLatex } from './latex.ts'

describe('prepareLatex', () => {
	it('combines strings, numbers, arrays, and TeX-compatible objects', () => {
		expect(prepareLatex(['x = ', 2, { tex: 'a+b', toString: () => 'unused' }])).toBe('x = {2}{a+b}')
	})

	it('escapes unescaped percentage signs only once', () => {
		expect(prepareLatex('10% + 20\\%')).toBe('10\\% + 20\\%')
	})

	it('uses ordinary parentheses for grouping while preserving scalable delimiters', () => {
		expect(prepareLatex('x^(a+(b)) + \\left(c\\right)')).toBe('x^{a+{b}} + \\left(c\\right)')
	})

	it('rejects unmatched grouping parentheses', () => {
		expect(() => prepareLatex('(x')).toThrow('without a corresponding closing parenthesis')
		expect(() => prepareLatex('x)')).toThrow('without a corresponding opening parenthesis')
	})
})
