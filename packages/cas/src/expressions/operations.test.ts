import { expectExpressionToEqual } from '../tests/support/wrapperAssertions'

import { expressionOperations } from './operations'

describe('expressionOperations', () => {
	test('multiplies the numerator and denominator of fractions', () => {
		expectExpressionToEqual(expressionOperations.multiplyNumeratorAndDenominator('x/y', 2), '(x*2)/(y*2)')
		expectExpressionToEqual(expressionOperations.multiplyNumeratorAndDenominator('x/y', 2, { putAtStart: true }), '(2*x)/(2*y)')
	})

	test('preserves a sign around a fraction', () => {
		expectExpressionToEqual(expressionOperations.multiplyNumeratorAndDenominator('-(x/y)', 2), '-((x*2)/(y*2))')
	})

	test('creates a fraction for non-fraction inputs', () => {
		expectExpressionToEqual(expressionOperations.multiplyNumeratorAndDenominator('x', 2), '(x*2)/2')
	})
})
