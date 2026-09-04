import { describe, expect, test } from 'vitest'

import { asEquation, deserializeEquation, equationToInputValue, inputValueToEquation, serializeEquation } from '../../equations/index.ts'

describe('expression and equation workflows', () => {
	test('parses, transforms, serializes, restores, and compares an equation', () => {
		const parsed = asEquation('x+0=2+3', undefined, { angleUnit: 'degrees' })
		const transformed = parsed.mapExpressions(expression => expression.removeTrivial()).mergeNumbers()
		const restored = deserializeEquation(serializeEquation(transformed))
		expect(restored.strictEqualStructure(asEquation('x=5'))).toBe(true)
		expect(restored.settings.angleUnit).toBe('degrees')
	})

	test('round-trips equation input values before applying simultaneous substitution', () => {
		const restored = inputValueToEquation(equationToInputValue(asEquation('x+y=y')))
		const substituted = restored.substitute(['x', 'y'], ['y', 'z'])
		expect(substituted.strictEqualStructure(asEquation('y+z=z'))).toBe(true)
	})
})
