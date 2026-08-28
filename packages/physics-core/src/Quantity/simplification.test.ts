import { describe, expect, test } from 'vitest'

import { defaultQuantitySimplificationOptions, resolveQuantitySimplificationOptions } from './simplification.ts'

describe('resolveQuantitySimplificationOptions', () => {
	test('applies all defaults', () => {
		expect(resolveQuantitySimplificationOptions()).toEqual(defaultQuantitySimplificationOptions)
	})

	test('resolves unit and value options together', () => {
		expect(resolveQuantitySimplificationOptions({ target: 'base', combine: false, sort: false, simplifyPrecisionNumber: false })).toEqual({ target: 'base', combine: false, sort: false, simplifyPrecisionNumber: false })
	})

	test('rejects invalid options', () => {
		expect(() => resolveQuantitySimplificationOptions({ target: 'invalid' as never })).toThrow(RangeError)
		expect(() => resolveQuantitySimplificationOptions({ simplifyPrecisionNumber: 'yes' as never })).toThrow(/boolean/)
	})
})
