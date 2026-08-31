import type { ExpressionInputValue } from '@step-wise/math-input-value'

import { areNodesEqual } from '../../operations/index.ts'

import { fraction, sum } from '../creation/index.ts'

import { interpretExpressionInputValue } from './interpretExpressionInputValue.ts'

describe('interpretExpressionInputValue', () => {
	test('interprets text and constructs together', () => {
		const input: ExpressionInputValue = { type: 'Expression', value: ['x+', { type: 'Fraction', numerator: ['1'], denominator: ['2'] }, ''] }
		expect(areNodesEqual(interpretExpressionInputValue(input), sum('x', fraction(1, 2)), false)).toBe(true)
	})

	test('uses interpretation settings carried by the value', () => {
		const input: ExpressionInputValue = { type: 'Expression', value: ['speed'], interpretationSettings: { allowMultiCharacterVariables: true } }
		expect(interpretExpressionInputValue(input).subtype).toBe('Variable')
	})
})
