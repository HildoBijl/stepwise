import { describe, expect, it, vi } from 'vitest'

import { resolveSolution } from './solutions'

describe('resolveSolution', () => {
	it('resolves a solution generator with the parameters', () => {
		expect(resolveSolution(({ value }: { value: number }) => ({ answer: value * 2 }), { value: 3 })).toEqual({ answer: 6 })
	})

	it('returns a static solution when no dynamic generator exists', () => {
		expect(resolveSolution({ getStaticSolution: () => ({ fixed: 2 }) }, {})).toEqual({ fixed: 2 })
	})

	it('combines static and dynamic fields and lets dynamic fields override', () => {
		const getInputDependency = vi.fn((input: Record<string, unknown>) => input.selected)
		const solution = resolveSolution({
			getStaticSolution: ({ base }: { base: number }) => ({ base, answer: 0 }),
			dependentFields: ['selected'],
			getInputDependency,
			getDynamicSolution: (selected, staticSolution, parameters) => ({ answer: Number(selected) + Number(staticSolution.base) + parameters.base }),
		}, { base: 2 }, { selected: 3, ignored: 9 })

		expect(getInputDependency).toHaveBeenCalledWith({ selected: 3 }, { base: 2, answer: 0 })
		expect(solution).toEqual({ base: 2, answer: 7 })
	})

	it('uses the filtered input directly when no dependency resolver is supplied', () => {
		const solution = resolveSolution({
			getStaticSolution: () => ({}),
			dependentFields: ['answer'],
			getDynamicSolution: input => ({ answer: (input as { answer: number }).answer }),
		}, {}, { answer: 5, ignored: 8 })
		expect(solution).toEqual({ answer: 5 })
	})

	it('rejects malformed solution definitions', () => {
		expect(() => resolveSolution(null as never, {})).toThrow()
		expect(() => resolveSolution({} as never, {})).toThrow()
	})
})
