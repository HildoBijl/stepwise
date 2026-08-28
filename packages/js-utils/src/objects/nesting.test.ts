import { describe, expect, it } from 'vitest'

import { getByPath, setByPath } from './nesting.ts'

describe('object nesting', () => {
	it('reads nested values and stops at missing paths', () => {
		const input = { a: [{ b: 2 }] }
		expect(getByPath(input, ['a', 0, 'b'])).toBe(2)
		expect(getByPath(input, ['missing', 'value'])).toBeUndefined()
		expect(getByPath(input, [])).toBe(input)
		expect(() => getByPath(input, ['a', true] as never)).toThrow(TypeError)
	})

	it('sets nested values immutably and creates containers', () => {
		const sibling = { stable: true }
		const input = { a: [{ b: 1 }], sibling }
		const result = setByPath(input, ['a', 0, 'b'], 2) as typeof input
		expect(result).toEqual({ a: [{ b: 2 }], sibling })
		expect(input.a[0].b).toBe(1)
		expect(result.sibling).toBe(sibling)
		expect(setByPath({}, ['a', 0, 'b'], 3)).toEqual({ a: [{ b: 3 }] })
	})

	it('handles empty paths and rejects invalid intermediate values', () => {
		expect(setByPath({}, [], 4)).toBe(4)
		expect(() => setByPath({ a: 1 }, ['a', 'b'], 2)).toThrow(TypeError)
		expect(() => setByPath(null, ['a'], 1)).toThrow(TypeError)
	})
})
