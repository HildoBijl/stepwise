import { describe, expect, it } from 'vitest'

import { ensureBoolean, ensureObject, hasOnlyKeys, isBoolean, isObject } from './checks.ts'

describe('object checks', () => {
	it('recognizes and ensures non-null objects', () => {
		const object = {}
		expect(isObject(object)).toBe(true)
		expect(isObject([])).toBe(true)
		expect(isObject(null)).toBe(false)
		expect(isObject(() => undefined)).toBe(false)
		expect(ensureObject(object)).toBe(object)
		expect(() => ensureObject(null)).toThrow(TypeError)
	})

	it('recognizes and ensures booleans', () => {
		expect(isBoolean(false)).toBe(true)
		expect(isBoolean(0)).toBe(false)
		expect(ensureBoolean(true)).toBe(true)
		expect(() => ensureBoolean('true')).toThrow(TypeError)
	})

	it('allows only enumerable own keys', () => {
		const inherited = Object.create({ inherited: true }) as Record<string, unknown>
		inherited.own = true
		expect(hasOnlyKeys(inherited, ['own'])).toBe(true)
		expect(hasOnlyKeys({ a: 1, b: 2 }, ['a'])).toBe(false)
	})
})
