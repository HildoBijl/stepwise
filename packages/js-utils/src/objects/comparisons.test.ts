import { describe, expect, it } from 'vitest'

import { deepEqual } from './comparisons'

describe('deep object equality', () => {
	it('compares primitives and supported object types', () => {
		expect(deepEqual(Number.NaN, Number.NaN)).toBe(true)
		expect(deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true)
		expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false)
		expect(deepEqual(new Date(10), new Date(10))).toBe(true)
		expect(deepEqual(/abc/gi, /abc/gi)).toBe(true)
		expect(deepEqual(/abc/g, /abc/i)).toBe(false)
	})

	it('compares symbol keys and distinguishes prototypes and sparse arrays', () => {
		const key = Symbol('key')
		expect(deepEqual({ [key]: 1 }, { [key]: 1 })).toBe(true)
		expect(deepEqual(Object.create(null), {})).toBe(false)
		expect(deepEqual([, 1], [undefined, 1])).toBe(false)
	})

	it('supports matching circular reference structures', () => {
		const a: Record<string, unknown> = {}
		const b: Record<string, unknown> = {}
		a.self = a
		b.self = b
		expect(deepEqual(a, b)).toBe(true)
		expect(deepEqual({ left: a, right: a }, { left: b, right: {} })).toBe(false)
	})

	it('rejects unsupported object types', () => {
		expect(() => deepEqual(new Map(), new Map())).toThrow(TypeError)
		expect(() => deepEqual(new Set(), new Set())).toThrow(TypeError)
	})
})
