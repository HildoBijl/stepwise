import { describe, expect, test } from 'vitest'

import { fraction, ln, log, negative, number, plusMinus, power, product, root, sin, sqrt, sum } from '../../../construction/index.ts'

import { areNumbersEqual, evaluateNumericNode, tryToEvaluateNumericNode } from './numeric.ts'

describe('numeric evaluation', () => {
	test('evaluates arithmetic expression trees', () => {
		expect(evaluateNumericNode(sum(2, product(3, 4), fraction(1, 2)))).toBe(14.5)
		expect(evaluateNumericNode(power(2, 3))).toBe(8)
		expect(evaluateNumericNode(negative(2))).toBe(-2)
	})

	test('evaluates roots and logarithms', () => {
		expect(evaluateNumericNode(sqrt(25))).toBe(5)
		expect(evaluateNumericNode(root(-27, 3))).toBeCloseTo(-3)
		expect(evaluateNumericNode(ln(Math.E))).toBeCloseTo(1)
		expect(evaluateNumericNode(log(100, 10))).toBeCloseTo(2)
	})

	test('respects angle settings', () => {
		expect(evaluateNumericNode(sin(90), { angleUnit: 'degrees' })).toBeCloseTo(1)
		expect(evaluateNumericNode(sin(Math.PI / 2), { angleUnit: 'radians' })).toBeCloseTo(1)
	})

	test.each([plusMinus(2), root(-4, 2), fraction(1, 0), power(0, 0), sum('x', 1)])('throws for a non-singular or non-finite value', node => {
		expect(() => evaluateNumericNode(node)).toThrow()
		expect(tryToEvaluateNumericNode(node)).toBeUndefined()
	})

	test('compares numeric forms by value', () => {
		expect(areNumbersEqual(fraction(1, 2), number(0.5))).toBe(true)
	})
})
