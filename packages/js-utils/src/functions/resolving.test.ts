import { describe, expect, it } from 'vitest'

import { resolveFunctionValue, resolveFunctionValuesDeep } from './resolving.ts'

describe('function value resolution', () => {
	it('resolves a function with forwarded arguments', () => {
		expect(resolveFunctionValue((a: number, b: number) => a + b, 2, 3)).toBe(5)
		expect(resolveFunctionValue(4, 2, 3)).toBe(4)
	})

	it('resolves nested functions without mutating the input', () => {
		const stable = { value: 2 }
		const input = { stable, dynamic: (n: number) => n * 2, nested: [1, (n: number) => n + 1] }
		const result = resolveFunctionValuesDeep(input, 3) as typeof input
		expect(result).toEqual({ stable: { value: 2 }, dynamic: 6, nested: [1, 4] })
		expect(result.stable).toBe(stable)
		expect(input.dynamic).toBeTypeOf('function')
	})
})
