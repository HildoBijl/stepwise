import { describe, expect, it } from 'vitest'

import { filterProperties, mapValues, mergeDefaults, omitDefaults, omitKeys, pickFromDefaults, pickKeys, preserveRefs } from './manipulation'

describe('object manipulation', () => {
	it('maps arrays and objects with result context', () => {
		expect(mapValues<number, number>([1, 2], (value, index, result) => value + index + (result[0] ?? 0))).toEqual([1, 4])
		expect(mapValues<number, number>({ a: 1, b: 2 }, (value, key, result) => key === 'b' ? value + (result.a ?? 0) : value)).toEqual({ a: 1, b: 3 })
		expect(mapValues({ a: 1, b: 2 }, (_, key) => key === 'a' ? undefined : 2)).toEqual({ b: 2 })
		expect(() => mapValues(new Date() as never, () => 1)).toThrow(TypeError)
	})

	it('preserves deeply equal references where possible', () => {
		const oldStable = { value: 1 }
		const oldValue = { stable: oldStable, changed: { value: 1 } }
		const newValue = { stable: { value: 1 }, changed: { value: 2 } }
		const result = preserveRefs(newValue, oldValue)
		expect(result).not.toBe(oldValue)
		expect(result.stable).toBe(oldStable)
		expect(result.changed).not.toBe(newValue.changed)
		expect(result.changed).toEqual(newValue.changed)
	})

	it('picks and omits own keys without mutating input', () => {
		const input = { a: 1, b: 2, c: undefined }
		expect(pickKeys(input, ['b', 'missing', 'c'])).toEqual({ b: 2, c: undefined })
		expect(pickFromDefaults(input, { a: 0, c: 0 })).toEqual({ a: 1, c: undefined })
		expect(omitKeys(input, ['b'])).toEqual({ a: 1, c: undefined })
		expect(omitDefaults(input, { a: 1, b: 0 })).toEqual({ b: 2 })
		expect(input).toEqual({ a: 1, b: 2, c: undefined })
	})

	it('merges defaults and controls unknown keys', () => {
		expect(mergeDefaults({ a: 2 }, { a: 1, b: 3 })).toEqual({ a: 2, b: 3 })
		expect(() => mergeDefaults({ extra: 1 }, { a: 1 })).toThrow()
		expect(mergeDefaults({ a: 2, extra: 1 }, { a: 1 }, { filterUnknownKeys: true })).toEqual({ a: 2 })
	})

	it('filters properties with value, key and source context', () => {
		const input = { a: 1, b: 2 }
		expect(filterProperties(input, (value, key, source) => value === 2 && key === 'b' && source === input)).toEqual({ b: 2 })
	})
})
