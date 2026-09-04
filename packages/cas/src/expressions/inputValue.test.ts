import { describe, expect, test } from 'vitest'

import { expectExpressionToEqual } from '../tests/support/wrapperAssertions.ts'

import { asExpression } from './Expression.ts'
import { expressionToInputValue, inputValueToExpression } from './inputValue.ts'

describe('expression input-value conversion', () => {
	test('round-trips representative expressions', () => {
		for (const expression of ['2*x+3', 'x_1+x_2^2+dot(x)_3', '(x+y)/z', 'sqrt(x^2+1)']) {
			const value = asExpression(expression)
			expectExpressionToEqual(inputValueToExpression(expressionToInputValue(value)), value)
		}
	})

	test('retains interpretation and expression settings', () => {
		const expression = asExpression('xy+sin(x)', { allowMultiCharacterVariables: true }, { angleUnit: 'degrees' })
		const restored = inputValueToExpression(expressionToInputValue(expression))
		expectExpressionToEqual(restored, expression)
		expect(restored.settings.angleUnit).toBe('degrees')
	})
})
