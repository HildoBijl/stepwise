import { describe, expect, test } from 'vitest'

import { asExpression } from './Expression.ts'
import { asExpressionEqualityOptions, defaultExpressionEqualityOptions, isExpressionEqualityOptionsInput } from './equalityOptions.ts'

describe('expression equality options', () => {
	test('resolves defaults and overrides', () => {
		expect(asExpressionEqualityOptions({})).toEqual(defaultExpressionEqualityOptions)
		expect(asExpressionEqualityOptions({ allowOrderChanges: false }).allowOrderChanges).toBe(false)
	})

	test('recognizes expression equality option inputs', () => {
		expect(isExpressionEqualityOptionsInput({})).toBe(true)
		expect(isExpressionEqualityOptionsInput({ allowOrderChanges: false, preprocess: expression => expression })).toBe(true)
		expect(isExpressionEqualityOptionsInput(undefined)).toBe(false)
		expect(isExpressionEqualityOptionsInput({ allowOrderChanges: 'yes' })).toBe(false)
		expect(isExpressionEqualityOptionsInput({ preprocess: true })).toBe(false)
		expect(isExpressionEqualityOptionsInput({ extra: true })).toBe(false)
	})

	test('applies preprocessing during equality checks', () => {
		expect(asExpression('x+0').equals('x', { preprocess: expression => expression.removeTrivial() })).toBe(true)
	})
})
