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

		expect(areValuesEqual(11, 10, { equality, equalityOptions: { tolerance: 1 } })).toBe(true)
		expect(equality.areEqual).toHaveBeenCalledWith(11, 10, { tolerance: 1 })
	})

	it('passes omitted equality options through as undefined', () => {
		const equality = { ...numberEquality, areEqual: vi.fn(numberEquality.areEqual) }

		expect(areValuesEqual(10, 10, { equality })).toBe(true)
		expect(equality.areEqual).toHaveBeenCalledWith(10, 10, undefined)
	})

	it('supports adapters without options or an options guard', () => {
		expect(areValuesEqual('answer', 'answer', { equality: stringEquality })).toBe(true)
		expect(() => areValuesEqual('answer', 'answer', { equality: stringEquality, equalityOptions: {} } as never)).toThrow(/equality options/)
	})

	it('returns false equality results unchanged', () => {
		expect(areValuesEqual(1, 2, { equality: numberEquality })).toBe(false)
	})

	it('rejects input and expected values that do not match the adapter', () => {
		expect(() => areValuesEqual('1', 1, { equality: numberEquality })).toThrow(/input value/)
		expect(() => areValuesEqual(1, '1', { equality: numberEquality })).toThrow(/expected value/)
	})

	it('rejects equality options that do not match the adapter', () => {
		expect(() => areValuesEqual(1, 1, { equality: numberEquality, equalityOptions: { tolerance: 'one' } as never })).toThrow(/equality options/)
	})

	it('rejects malformed adapters', () => {
		expect(() => areValuesEqual(1, 1, { equality: { isValue: numberEquality.isValue } as never })).toThrow(/equality adapter/)
	})

	it('rejects equality results that are not booleans', () => {
		const equality = { ...numberEquality, areEqual: (() => 'yes') as never }
		expect(() => areValuesEqual(1, 1, { equality })).toThrow(TypeError)
	})

	it('does not hide errors thrown by the equality operation', () => {
		const error = new Error('Equality failed.')
		const equality = { ...numberEquality, areEqual: () => { throw error } }
		expect(() => areValuesEqual(1, 1, { equality })).toThrow(error)
	})
})
