import { describe, expect, it } from 'vitest'

import { asExpression } from '@step-wise/cas'

import { expressionEqualityAdapter, expressionInputValueAdapter, expressionSerializationAdapter } from './expression.ts'

describe('expression value type', () => {
	it('converts expressions to and from input values', () => {
		const expression = asExpression('xy+sin(x)', { allowMultiCharacterVariables: true }, { angleUnit: 'degrees' })
		const inputValue = expressionInputValueAdapter.toInputValue(expression)
		const restored = expressionInputValueAdapter.interpret(inputValue)

		expect(expressionInputValueAdapter.isInputValue(inputValue)).toBe(true)
		expect(expressionInputValueAdapter.isDomainValue(restored)).toBe(true)
		expect(restored.strictEqualStructure(expression)).toBe(true)
	})

	it('serializes and deserializes expressions', () => {
		const expression = asExpression('sin(x)+1', undefined, { angleUnit: 'degrees' })
		const serialized = expressionSerializationAdapter.serialize(expression)
		const restored = expressionSerializationAdapter.deserialize(serialized)

		expect(expressionSerializationAdapter.isSerializedValue(serialized)).toBe(true)
		expect(restored.strictEqualStructure(expression)).toBe(true)
		expect(restored.settings).toEqual(expression.settings)
	})

	it('compares expressions with validated equality options', () => {
		const options = { preprocess: (expression: ReturnType<typeof asExpression>) => expression.removeTrivial() }
		expect(expressionEqualityAdapter.isOptions(options)).toBe(true)
		expect(expressionEqualityAdapter.areEqual(asExpression('x+0'), asExpression('x'), options)).toBe(true)
		expect(expressionEqualityAdapter.areEqual(asExpression('x+1'), asExpression('x'), undefined)).toBe(false)
	})
})
