import { asExpression } from './Expression.ts'
import { asExpressionEqualityOptions, defaultExpressionEqualityOptions } from './equalityOptions.ts'

describe('expression equality options', () => {
	test('resolves defaults and overrides', () => {
		expect(asExpressionEqualityOptions({})).toEqual(defaultExpressionEqualityOptions)
		expect(asExpressionEqualityOptions({ allowOrderChanges: false }).allowOrderChanges).toBe(false)
	})

	test('applies preprocessing during equality checks', () => {
		expect(asExpression('x+0').equals('x', { preprocess: expression => expression.removeTrivial() })).toBe(true)
	})
})
