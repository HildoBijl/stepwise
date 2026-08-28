import { describe, expect, it, vi } from 'vitest'

import { ensureFunction, identity, noop } from './fundamentals.ts'

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
})
