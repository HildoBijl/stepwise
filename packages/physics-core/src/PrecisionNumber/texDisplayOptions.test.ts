import { describe, expect, test } from 'vitest'

import { defaultTexDisplayOptions, resolveTexDisplayOptions } from './texDisplayOptions'

describe('resolveTexDisplayOptions', () => {
	test('applies defaults without sharing the default object', () => {
		const result = resolveTexDisplayOptions()
		expect(result).toEqual(defaultTexDisplayOptions)
		expect(result).not.toBe(defaultTexDisplayOptions)
	})

	test.each([',', '.'] as const)('accepts "%s" as decimal separator', decimalSeparator => {
		expect(resolveTexDisplayOptions({ decimalSeparator })).toEqual({ decimalSeparator })
	})

	test('rejects unsupported decimal separators', () => {
		expect(() => resolveTexDisplayOptions({ decimalSeparator: ';' as never })).toThrow(RangeError)
	})
})
