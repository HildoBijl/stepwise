import { describe, expect, test } from 'vitest'

import { power, product, sum } from '../../../construction/index.ts'

import { areNodesEqual } from '../inspection/index.ts'

import { substitute } from './replacing.ts'

describe('substitute', () => {
	test('substitutes a variable recursively', () => {
		const expression = sum(power('x', 2), product(3, 'x'), 1)
		const result = substitute(expression, 'x', product(2, 'y'))
		const expected = sum(power(product(2, 'y'), 2), product(3, product(2, 'y')), 1)
		expect(areNodesEqual(result, expected, false)).toBe(true)
	})

	test('reuses unchanged nodes', () => {
		const expression = sum('x', 'z')
		expect(substitute(expression, 'y', 2)).toBe(expression)
		const result = substitute(expression, 'x', 'y')
		expect(result).not.toBe(expression)
		expect(result.children[1]).toBe(expression.children[1])
	})
})
