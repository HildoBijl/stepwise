import { describe, expect, it, vi } from 'vitest'

import { resolveSolution } from './solutions.ts'

describe('resolveSolution', () => {
	it('resolves a solution generator with the parameters', async () => {
		await expect(resolveSolution(({ value }: { value: number }) => ({ answer: value * 2 }), { value: 3 })).resolves.toEqual({ answer: 6 })
	})

	it('returns a static solution when no dynamic generator exists', async () => {
		await expect(resolveSolution({ getStaticSolution: () => ({ fixed: 2 }) }, {})).resolves.toEqual({ fixed: 2 })
	})

	it('combines static and dynamic fields and lets dynamic fields override', async () => {
		const getInputDependency = vi.fn((input: Record<string, unknown>) => input.selected)
		const solution = await resolveSolution({
			getStaticSolution: ({ base }: { base: number }) => ({ base, answer: 0 }),
			dependentFields: ['selected'],
			getInputDependency,
			getDynamicSolution: (selected, staticSolution, parameters) => ({ answer: Number(selected) + Number(staticSolution.base) + parameters.base }),
		}, { base: 2 }, { selected: 3, ignored: 9 })

		expect(getInputDependency).toHaveBeenCalledWith({ selected: 3 }, { base: 2, answer: 0 })
		expect(solution).toEqual({ base: 2, answer: 7 })
	})

	it('uses the filtered input directly when no dependency resolver is supplied', async () => {
		const solution = await resolveSolution({
			getStaticSolution: () => ({}),
			dependentFields: ['answer'],
			getDynamicSolution: input => ({ answer: (input as { answer: number }).answer }),
		}, {}, { answer: 5, ignored: 8 })
		expect(solution).toEqual({ answer: 5 })
	})

	it('awaits every stage of a dynamic solution', async () => {
		await expect(resolveSolution({
			getStaticSolution: async () => ({ base: 2 }),
			getInputDependency: async input => input.answer,
			getDynamicSolution: async (answer, staticSolution) => ({ answer: Number(answer) + Number(staticSolution.base) }),
		}, {}, { answer: 3 })).resolves.toEqual({ base: 2, answer: 5 })
	})

	it('rejects malformed solution definitions', async () => {
		await expect(resolveSolution(null as never, {})).rejects.toThrow()
		await expect(resolveSolution({} as never, {})).rejects.toThrow()
	})
})
