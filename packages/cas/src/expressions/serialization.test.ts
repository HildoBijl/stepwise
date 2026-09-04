import { describe, expect, test } from 'vitest'

import { asExpression } from './Expression.ts'
import { deserializeExpression, isExpressionStorageValue, isSerializedExpression, serializeExpression } from './serialization.ts'

describe('expression serialization', () => {
	test('round-trips storage and wrapper settings', () => {
		const expression = asExpression('sin(x)+1', undefined, { angleUnit: 'degrees' })
		const serialized = serializeExpression(expression)
		expect(isExpressionStorageValue(serialized.value)).toBe(true)
		expect(isSerializedExpression(serialized)).toBe(true)
		const restored = deserializeExpression(serialized)
		expect(restored.strictEqualStructure(expression)).toBe(true)
		expect(restored.settings).toEqual(expression.settings)
	})

	test('omits default settings and retains non-default settings', () => {
		expect(serializeExpression(asExpression('x'))).not.toHaveProperty('settings')
		expect(serializeExpression(asExpression('sin(x)', undefined, { angleUnit: 'degrees' })).settings).toEqual({ angleUnit: 'degrees' })
	})

	test.each([
		{ type: 'Equation', value: { subtype: 'Variable', symbol: 'x' } },
		{ type: 'Expression' },
		{ type: 'Expression', value: { subtype: 'Variable', symbol: '' } },
		{ type: 'Expression', value: { subtype: 'Variable', symbol: 'x' }, settings: { angleUnit: 'gradians' } },
		{ type: 'Expression', value: { subtype: 'Variable', symbol: 'x' }, extra: true },
	])('rejects an invalid serialized Expression', serialized => {
		expect(isSerializedExpression(serialized)).toBe(false)
		expect(() => deserializeExpression(serialized)).toThrow('Invalid serialized Expression')
	})
})
