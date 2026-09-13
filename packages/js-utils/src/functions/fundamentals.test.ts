import { describe, expect, expectTypeOf, it, vi } from 'vitest'

import { type Awaitable, ensureFunction, identity, noop } from './fundamentals.ts'

describe('function fundamentals', () => {
	it('provides noop and identity helpers', () => {
		expect(noop()).toBeUndefined()
		const value = {}
		expect(identity(value)).toBe(value)
	})

	it('ensures and preserves functions', () => {
		const fn = vi.fn()
		expect(ensureFunction(fn)).toBe(fn)
		expect(() => ensureFunction(1)).toThrow(TypeError)
	})

	it('defines synchronous values and promises as awaitable', () => {
		expectTypeOf<number>().toExtend<Awaitable<number>>()
		expectTypeOf<Promise<number>>().toExtend<Awaitable<number>>()
	})
})
