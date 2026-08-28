import { describe, expect, it } from 'vitest'

import { fromKeys, fromKeysAndValues } from './creation.ts'

describe('object creation', () => {
	it('creates values with mapper context and filters undefined by default', () => {
		const result = fromKeys(['a', 'b', 'c'], (key, index, partial) => key === 'b' ? undefined : `${key}${index}${Object.keys(partial).length}`)
		expect(result).toEqual({ a: 'a00', c: 'c21' })
		expect(fromKeys(['a'], () => undefined, { filterUndefined: false })).toEqual({ a: undefined })
	})

	it('creates values from parallel arrays', () => {
		expect(fromKeysAndValues(['a', 'b'], [1, 2])).toEqual({ a: 1, b: 2 })
		expect(() => fromKeysAndValues(['a'], [1, 2])).toThrow(RangeError)
	})

	it('defines dangerous keys as own data properties', () => {
		const result = fromKeysAndValues(['__proto__'], [3])
		expect(Object.prototype.hasOwnProperty.call(result, '__proto__')).toBe(true)
		expect(result.__proto__).toBe(3)
		expect(Object.getPrototypeOf(result)).toBe(Object.prototype)
	})
})
