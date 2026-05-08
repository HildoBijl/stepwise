import { sum, product, fraction, negative, power } from '../../../construction'

import { equalNodes } from '../fundamentals'

import { add, subtract, multiply, divide } from './arithmetic'
import { substitute } from './substitution'

describe('structural arithmetic operations', () => {
	test('add', () => {
		expect(equalNodes(add('x', 'y', 2), sum('x', 'y', 2))).toBe(true)
	})

	test('subtract', () => {
		expect(equalNodes(subtract('x', 'y'), sum('x', negative('y')))).toBe(true)
	})

	test('multiply', () => {
		expect(equalNodes(multiply(2, 'x', 'y'), product(2, 'x', 'y'))).toBe(true)
	})

	test('divide', () => {
		expect(equalNodes(divide('x', 3), fraction('x', 3))).toBe(true)
	})
})

describe('substitute', () => {
	test('substitutes a variable', () => {
		const expression = sum(power('x', 2), product(3, 'x'), 1)
		const result = substitute(expression, 'x', product(2, 'y'))
		const expected = sum(power(product(2, 'y'), 2), product(3, product(2, 'y')), 1)
		expect(equalNodes(result, expected)).toBe(true)
	})

	test('does not replace unrelated variables', () => {
		const expression = sum('x', 'z')
		const result = substitute(expression, 'y', 2)
		expect(result).toBe(expression)
	})

	test('reuses unchanged descendants', () => {
		const expression = sum('x', 'z')
		const result = substitute(expression, 'x', 'y')
		expect(result).not.toBe(expression)
		expect(result.children[1]).toBe(expression.children[1])
	})
})
