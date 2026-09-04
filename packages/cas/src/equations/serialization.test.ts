import { describe, expect, test } from 'vitest'

import { asEquation } from './Equation.ts'
import { deserializeEquation, isEquationStorageValue, isSerializedEquation, serializeEquation } from './serialization.ts'

describe('equation serialization', () => {
	test('round-trips storage and wrapper settings', () => {
		const equation = asEquation('sin(x)=1', undefined, { angleUnit: 'degrees' })
		const serialized = serializeEquation(equation)
		expect(isEquationStorageValue(serialized.value)).toBe(true)
		expect(isSerializedEquation(serialized)).toBe(true)
		const restored = deserializeEquation(serialized)
		expect(restored.strictEqualStructure(equation)).toBe(true)
		expect(restored.settings).toEqual(equation.settings)
	})

	test('omits default settings and retains non-default settings', () => {
		expect(serializeEquation(asEquation('x=1'))).not.toHaveProperty('settings')
		expect(serializeEquation(asEquation('sin(x)=1', undefined, { angleUnit: 'degrees' })).settings).toEqual({ angleUnit: 'degrees' })
	})

	test.each([
		{ type: 'Expression', value: { left: { subtype: 'Variable', symbol: 'x' }, right: { subtype: 'Integer', value: 1 } } },
		{ type: 'Equation', value: { left: { subtype: 'Variable', symbol: 'x' } } },
		{ type: 'Equation', value: { left: { subtype: 'Variable', symbol: '' }, right: { subtype: 'Integer', value: 1 } } },
		{ type: 'Equation', value: { left: { subtype: 'Variable', symbol: 'x' }, right: { subtype: 'Integer', value: 1 }, middle: {} } },
		{ type: 'Equation', value: { left: { subtype: 'Variable', symbol: 'x' }, right: { subtype: 'Integer', value: 1 } }, settings: { angleUnit: 'gradians' } },
	])('rejects an invalid serialized Equation', serialized => {
		expect(isSerializedEquation(serialized)).toBe(false)
		expect(() => deserializeEquation(serialized)).toThrow('Invalid serialized Equation')
	})
})
