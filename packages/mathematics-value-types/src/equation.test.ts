import { describe, expect, it } from 'vitest'

import { asEquation } from '@step-wise/cas'

import { equationEqualityAdapter, equationInputValueAdapter, equationSerializationAdapter } from './equation.ts'

describe('equation value type', () => {
	it('converts equations to and from input values', () => {
		const equation = asEquation('2x+1=5')
		const inputValue = equationInputValueAdapter.toInputValue(equation)
		const restored = equationInputValueAdapter.interpret(inputValue)

		expect(equationInputValueAdapter.isInputValue(inputValue)).toBe(true)
		expect(equationInputValueAdapter.isDomainValue(restored)).toBe(true)
		expect(restored.strictEqualStructure(equation)).toBe(true)
	})

	it('serializes and deserializes equations', () => {
		const equation = asEquation('sin(x)=1', undefined, { angleUnit: 'degrees' })
		const serialized = equationSerializationAdapter.serialize(equation)
		const restored = equationSerializationAdapter.deserialize(serialized)

		expect(equationSerializationAdapter.isSerializedValue(serialized)).toBe(true)
		expect(restored.strictEqualStructure(equation)).toBe(true)
		expect(restored.settings).toEqual(equation.settings)
	})

	it('compares equations with validated equality options', () => {
		expect(equationEqualityAdapter.isOptions({ allowSideSwitch: true })).toBe(true)
		expect(equationEqualityAdapter.areEqual(asEquation('x=2'), asEquation('2=x'), { allowSideSwitch: true })).toBe(true)
		expect(equationEqualityAdapter.areEqual(asEquation('x=3'), asEquation('x=2'), undefined)).toBe(false)
	})
})
