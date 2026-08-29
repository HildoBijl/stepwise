import { describe, expect, it, vi } from 'vitest'

import type { ValueEqualityAdapter } from './types.ts'
import { areValuesEqual } from './areValuesEqual.ts'

type ToleranceOptions = { tolerance?: number }

const numberEquality: ValueEqualityAdapter<number, ToleranceOptions> = {
	isValue: (value): value is number => typeof value === 'number' && Number.isFinite(value),
	isOptions: (options): options is ToleranceOptions | undefined => {
		if (options === undefined) return true
		if (typeof options !== 'object' || options === null || Array.isArray(options)) return false
		const tolerance = (options as ToleranceOptions).tolerance
		return tolerance === undefined || typeof tolerance === 'number'
	},
	areEqual: (inputValue, expectedValue, options) => Math.abs(inputValue - expectedValue) <= (options?.tolerance ?? 0),
}

const stringEquality: ValueEqualityAdapter<string> = {
	isValue: (value): value is string => typeof value === 'string',
	areEqual: (inputValue, expectedValue) => inputValue === expectedValue,
}

describe('areValuesEqual', () => {
	it('passes narrowed values and equality options to the adapter', () => {
		const equality = { ...numberEquality, areEqual: vi.fn(numberEquality.areEqual) }

		expect(areValuesEqual(equality, 11, 10, { tolerance: 1 })).toBe(true)
		expect(equality.areEqual).toHaveBeenCalledWith(11, 10, { tolerance: 1 })
	})

	it('passes omitted equality options through as undefined', () => {
		const equality = { ...numberEquality, areEqual: vi.fn(numberEquality.areEqual) }

		expect(areValuesEqual(equality, 10, 10)).toBe(true)
		expect(equality.areEqual).toHaveBeenCalledWith(10, 10, undefined)
	})

	it('supports adapters without options or an options guard', () => {
		expect(areValuesEqual(stringEquality, 'answer', 'answer')).toBe(true)
		expect(() => areValuesEqual(stringEquality, 'answer', 'answer', {} as never)).toThrow(/equality options/)
	})

	it('returns false equality results unchanged', () => {
		expect(areValuesEqual(numberEquality, 1, 2)).toBe(false)
	})

	it('rejects input and expected values that do not match the adapter', () => {
		expect(() => areValuesEqual(numberEquality, '1', 1)).toThrow(/input value/)
		expect(() => areValuesEqual(numberEquality, 1, '1')).toThrow(/expected value/)
	})

	it('rejects equality options that do not match the adapter', () => {
		expect(() => areValuesEqual(numberEquality, 1, 1, { tolerance: 'one' } as never)).toThrow(/equality options/)
	})

	it('rejects malformed adapters', () => {
		expect(() => areValuesEqual({ isValue: numberEquality.isValue } as never, 1, 1)).toThrow(/equality adapter/)
	})

	it('rejects equality results that are not booleans', () => {
		const equality = { ...numberEquality, areEqual: (() => 'yes') as never }
		expect(() => areValuesEqual(equality, 1, 1)).toThrow(TypeError)
	})

	it('does not hide errors thrown by the equality operation', () => {
		const error = new Error('Equality failed.')
		const equality = { ...numberEquality, areEqual: () => { throw error } }
		expect(() => areValuesEqual(equality, 1, 1)).toThrow(error)
	})
})
