import { describe, expect, it, vi } from 'vitest'

import type { AnyValueEqualityAdapter, ValueEqualityAdapter } from './types.ts'
import { areValuesEqualFromAdapter, createAreValuesEqual } from './areValuesEqual.ts'

type ToleranceOptions = { tolerance?: number }

const numberEquality: ValueEqualityAdapter<number, ToleranceOptions> = {
	isValue: (value): value is number => typeof value === 'number' && Number.isFinite(value),
	isOptions: (options): options is ToleranceOptions => {
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

describe('areValuesEqualFromAdapter', () => {
	it('passes narrowed values and equality options to the adapter', () => {
		const equality = { ...numberEquality, areEqual: vi.fn(numberEquality.areEqual) }

		expect(areValuesEqualFromAdapter(equality, 11, 10, { tolerance: 1 })).toBe(true)
		expect(equality.areEqual).toHaveBeenCalledWith(11, 10, { tolerance: 1 })
	})

	it('accepts registry-erased adapters and validates their options at runtime', () => {
		const equality: AnyValueEqualityAdapter = numberEquality
		expect(areValuesEqualFromAdapter(equality, 11, 10, { tolerance: 1 })).toBe(true)
		expect(() => areValuesEqualFromAdapter(equality, 11, 10, { tolerance: 'one' })).toThrow(/equality options/)
	})

	it('passes omitted equality options through without running the options guard', () => {
		const equality = { ...numberEquality, isOptions: vi.fn(numberEquality.isOptions), areEqual: vi.fn(numberEquality.areEqual) }

		expect(areValuesEqualFromAdapter(equality, 10, 10)).toBe(true)
		expect(equality.isOptions).not.toHaveBeenCalled()
		expect(equality.areEqual).toHaveBeenCalledWith(10, 10, undefined)
	})

	it('supports adapters without options or an options guard', () => {
		expect(areValuesEqualFromAdapter(stringEquality, 'answer', 'answer')).toBe(true)
		expect(() => areValuesEqualFromAdapter(stringEquality, 'answer', 'answer', {} as never)).toThrow(/equality options/)
	})

	it('returns false equality results unchanged', () => {
		expect(areValuesEqualFromAdapter(numberEquality, 1, 2)).toBe(false)
	})

	it('rejects input and expected values that do not match the adapter', () => {
		expect(() => areValuesEqualFromAdapter(numberEquality, '1', 1)).toThrow(/input value/)
		expect(() => areValuesEqualFromAdapter(numberEquality, 1, '1')).toThrow(/expected value/)
	})

	it('rejects equality options that do not match the adapter', () => {
		expect(() => areValuesEqualFromAdapter(numberEquality, 1, 1, { tolerance: 'one' } as never)).toThrow(/equality options/)
	})

	it('rejects malformed adapters', () => {
		expect(() => areValuesEqualFromAdapter({ isValue: numberEquality.isValue } as never, 1, 1)).toThrow(/equality adapter/)
	})

	it('rejects equality results that are not booleans', () => {
		const equality = { ...numberEquality, areEqual: (() => 'yes') as never }
		expect(() => areValuesEqualFromAdapter(equality, 1, 1)).toThrow(TypeError)
	})

	it('does not hide errors thrown by the equality operation', () => {
		const error = new Error('Equality failed.')
		const equality = { ...numberEquality, areEqual: () => { throw error } }
		expect(() => areValuesEqualFromAdapter(equality, 1, 1)).toThrow(error)
	})
})

describe('createAreValuesEqual', () => {
	it('creates a type-keyed equality operation', () => {
		const compareValues = createAreValuesEqual({ Number: numberEquality })
		expect(compareValues('Number', 11, 10, { tolerance: 1 })).toBe(true)
		expect(compareValues('Number', 11, 10)).toBe(false)
		expect(() => compareValues('Unknown', 1, 1)).toThrow(/no equality adapter found/)
	})
})
