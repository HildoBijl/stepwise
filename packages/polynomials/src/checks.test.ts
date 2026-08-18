import { describe, expect, it } from 'vitest'

import { ensurePolynomialExpression, ensureVariableList } from './checks'

describe('ensureVariableList', () => {
	it('accepts valid variable lists', () => {
		const list = ['a', 'b']
		expect(ensureVariableList(list)).toBe(list)
		expect(ensureVariableList([])).toEqual([])
	})

	it.each([
		'a',
		['a', 2],
		[''],
		['a', 'a'],
	])('rejects invalid input %#', value => {
		expect(() => ensureVariableList(value)).toThrow()
	})
})

describe('ensurePolynomialExpression', () => {
	it('accepts valid constant and multivariable polynomials', () => {
		const constant = { matrix: 5, list: [] }
		expect(ensurePolynomialExpression(constant)).toBe(constant)
		expect(() => ensurePolynomialExpression({ matrix: [[2, 3], [4, 5]], list: ['a', 'b'] })).not.toThrow()
	})

	it.each([
		undefined,
		null,
		5,
		[],
		{},
		{ matrix: [1, 2], list: 'x' },
		{ matrix: [1, 2], list: [''] },
		{ matrix: [[1]], list: ['x', 'x'] },
		{ matrix: [1, Number.NaN], list: ['x'] },
		{ matrix: [1, Number.POSITIVE_INFINITY], list: ['x'] },
		{ matrix: [[1], [2, 3]], list: ['x', 'y'] },
		{ matrix: [1, 2], list: [] },
		{ matrix: [], list: ['x'] },
	])('rejects invalid input %#', value => {
		expect(() => ensurePolynomialExpression(value)).toThrow()
	})
})
