import { expectEquationToEqual } from '../tests/support/wrapperAssertions'

import { equationOperations } from './operations'

describe('equationOperations', () => {
	test('multiplies numerator and denominator on both sides', () => {
		expectEquationToEqual(equationOperations.multiplyNumeratorAndDenominator('x/y=a/b', 2), '(x*2)/(y*2)=(a*2)/(b*2)')
	})

	test('supports placing the factor first', () => {
		expectEquationToEqual(equationOperations.multiplyNumeratorAndDenominator('x/y=z', 2, true), '(2*x)/(2*y)=(2*z)/2')
	})
})
