import { describe, expect, it } from 'vitest'

import { createEmptyExpressionInputValue, createEmptyExpressionValue, createEquationInputValue, createExpressionInputValue, createExpressionInputValueFromText, isEmptyExpressionValue } from './fundamentals'

describe('expression-value fundamentals', () => {
	it('creates canonical empty values', () => {
		expect(createEmptyExpressionValue()).toEqual([''])
		expect(createEmptyExpressionInputValue()).toEqual({ type: 'Expression', value: [''] })
		expect(isEmptyExpressionValue([''])).toBe(true)
		expect(isEmptyExpressionValue(['x'])).toBe(false)
	})

	it('wraps expression values and text', () => {
		expect(createExpressionInputValue(['x'])).toEqual({ type: 'Expression', value: ['x'] })
		expect(createEquationInputValue(['x=1'])).toEqual({ type: 'Equation', value: ['x=1'] })
		expect(createExpressionInputValueFromText('abc')).toEqual({ type: 'Expression', value: ['abc'] })
	})

	it('stores only non-default settings', () => {
		expect(createExpressionInputValue(['x'], { recognizeLogarithms: false, interpretEAsConstant: true }, { angleUnit: 'degrees' })).toEqual({
			type: 'Expression', value: ['x'], interpretationSettings: { recognizeLogarithms: false }, expressionSettings: { angleUnit: 'degrees' },
		})
		expect(createExpressionInputValue(['x'], { recognizeLogarithms: true }, { angleUnit: 'radians' })).toEqual({ type: 'Expression', value: ['x'] })
	})

	it('rejects invalid expression values', () => {
		expect(() => createExpressionInputValue([])).toThrow(TypeError)
		expect(() => createEquationInputValue([{ type: 'Accent', name: 'dot', value: 'x' }] as never)).toThrow(TypeError)
		expect(() => isEmptyExpressionValue([])).toThrow('can never be an empty array')
	})
})
