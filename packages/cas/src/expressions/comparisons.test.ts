import { sum } from '../core/index.ts'

import { Expression, asExpression } from './Expression.ts'
import { expressionComparisons } from './comparisons.ts'

describe('expressionComparisons', () => {
	test('requires identical visible structure for exact equality', () => {
		const nestedSum = new Expression(sum(2, sum(3, 4)))
		const flatSum = new Expression(sum(2, 3, 4))
		expect(expressionComparisons.areExactlyEqual(nestedSum, flatSum)).toBe(false)
		expect(expressionComparisons.areExactlyEqual('-(2/3)', '(-2)/3')).toBe(false)
		expect(expressionComparisons.areExactlyEqual('x+2', 'x+2')).toBe(true)
	})

	test('allows only ordering and invisible list grouping when requested', () => {
		expect(expressionComparisons.areEqualExceptOrder('x+2', '2+x')).toBe(true)
		expect(expressionComparisons.areEqualExceptOrder('x+2', 'x+3')).toBe(false)
	})

	test('compares numeric values, equivalence, and multiples', () => {
		expect(expressionComparisons.haveEqualNumericValue('1/2', '0.5')).toBe(true)
		expect(expressionComparisons.haveEqualNumericValue('x', 1)).toBe(false)
		expect(expressionComparisons.areEquivalent('2*x+3*x', '5*x')).toBe(true)
		expect(expressionComparisons.areIntegerMultiples('6*x', '2*x')).toBe(true)
		expect(expressionComparisons.areConstantMultiples('3*x', '2*x')).toBe(true)
	})
})
