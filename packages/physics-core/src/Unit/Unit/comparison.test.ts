import { describe, expect, test } from 'vitest'

import { isUnitEqualityOptionsInput, resolveUnitEqualityOptions } from './comparison.ts'

describe('Unit comparison options', () => {
	test('recognizes Unit equality option inputs', () => {
		expect(isUnitEqualityOptionsInput({})).toBe(true)
		expect(isUnitEqualityOptionsInput({ target: 'base', combine: false, sort: true, checkSize: false })).toBe(true)
		expect(isUnitEqualityOptionsInput(undefined)).toBe(false)
		expect(isUnitEqualityOptionsInput({ target: 'invalid' })).toBe(false)
		expect(isUnitEqualityOptionsInput({ combine: 1 })).toBe(false)
		expect(isUnitEqualityOptionsInput({ sort: 'yes' })).toBe(false)
		expect(isUnitEqualityOptionsInput({ checkSize: 'yes' })).toBe(false)
		expect(isUnitEqualityOptionsInput({ extra: true })).toBe(false)
	})

	test('resolves partial equality options', () => {
		expect(resolveUnitEqualityOptions({ target: 'unchanged', checkSize: false })).toMatchObject({ target: 'unchanged', checkSize: false })
	})
})
