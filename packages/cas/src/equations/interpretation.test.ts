import { describe, expect, test } from 'vitest'

import { parseEquationInputValue } from '@step-wise/math-input-value'

import { asEquation } from './Equation.ts'
import { interpretEquationInput, isEquationInput } from './interpretation.ts'

describe('equation interpretation', () => {
	test('recognizes supported inputs', () => {
		expect(isEquationInput('x=1')).toBe(true)
		expect(isEquationInput({ left: 'x', right: 1 })).toBe(true)
		expect(isEquationInput(parseEquationInputValue('x=1'))).toBe(true)
		expect(isEquationInput({ left: 'x' })).toBe(false)
	})

	test('interprets strings, object inputs, and input values', () => {
		expect(interpretEquationInput('x=1').left.str).toBe('x')
		expect(interpretEquationInput({ left: 'x+1', right: 2 }).right.value).toBe(2)
		expect(interpretEquationInput(parseEquationInputValue('x=1')).right.value).toBe(1)
	})

	test('uses explicit settings over embedded settings', () => {
		const inputValue = parseEquationInputValue('sin(x)=1', undefined, { angleUnit: 'degrees' })
		const equation = asEquation(inputValue, undefined, { angleUnit: 'radians' })
		expect(equation.settings.angleUnit).toBe('radians')
		expect(equation.left.settings.angleUnit).toBe('radians')
		expect(equation.right.settings.angleUnit).toBe('radians')
	})

	test('interprets equation-object sides independently', () => {
		const equation = asEquation({
			left: asEquation('e=0').left,
			right: asEquation('e=0', { interpretEAsConstant: false }).left,
		})
		expect(equation.left.isNamedConstant()).toBe(true)
		expect(equation.right.isVariable()).toBe(true)
	})

	test('rejects missing and repeated equals signs', () => {
		expect(() => asEquation('x+1')).toThrow()
		expect(() => asEquation('x=1=2')).toThrow()
	})
})
