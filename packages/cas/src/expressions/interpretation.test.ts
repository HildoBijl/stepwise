import { parseExpressionInputValue } from '@step-wise/math-input-value'

import { Expression, asExpression } from './Expression'
import { interpretExpressionInput, isExpressionInput } from './interpretation'

describe('expression interpretation', () => {
	test('recognizes supported inputs', () => {
		expect(isExpressionInput('x')).toBe(true)
		expect(isExpressionInput(2)).toBe(true)
		expect(isExpressionInput(parseExpressionInputValue('x'))).toBe(true)
		expect(isExpressionInput({})).toBe(false)
	})

	test('interprets strings, numbers, and input values', () => {
		expect(new Expression(interpretExpressionInput('x+1').node).str).toBe('x+1')
		expect(new Expression(interpretExpressionInput(2).node).value).toBe(2)
		expect(new Expression(interpretExpressionInput(parseExpressionInputValue('x+1')).node).str).toBe('x+1')
	})

	test('merges embedded and explicit settings with explicit precedence', () => {
		const inputValue = parseExpressionInputValue('sin(x)', undefined, { angleUnit: 'degrees' })
		const result = asExpression(inputValue, undefined, { angleUnit: 'radians' })
		expect(result.settings.angleUnit).toBe('radians')
	})

	test('throws for unsupported runtime input', () => {
		expect(() => interpretExpressionInput({} as never)).toThrow('Invalid expression interpretation')
	})
})
