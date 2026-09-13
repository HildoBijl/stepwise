import { describe, expect, it, vi } from 'vitest'

import { resolveSolution, resolveStaticSolution, resolveUpdatedInputDependency } from './solutions.ts'

describe('resolveUpdatedInputDependency', () => {
	it('preserves the previous dependency when no updater is defined', async () => {
		await expect(resolveUpdatedInputDependency({}, {
			parameters: { value: 3 }, previousInputDependency: 2, input: {}, step: 0,
		})).resolves.toBe(2)
	})

	it('passes the complete update context to an asynchronous updater', async () => {
		const updateInputDependency = vi.fn(async ({ input }: { input: Record<string, unknown> }) => input.selected)
		const definition = { updateInputDependency }
		const data = { parameters: { value: 3 }, previousInputDependency: 1, input: { selected: 2 }, step: 2 }
		await expect(resolveUpdatedInputDependency(definition, data)).resolves.toBe(2)
		expect(updateInputDependency).toHaveBeenCalledWith(data)
	})
})

describe('solution resolution', () => {
	it('returns an empty static solution when no static generator is defined', async () => {
		await expect(resolveStaticSolution({}, { value: 3 })).resolves.toEqual({})
	})

	it('resolves synchronous and asynchronous static solution generators', async () => {
		await expect(resolveStaticSolution({ getStaticSolution: ({ value }: { value: number }) => ({ doubled: value * 2 }) }, { value: 3 })).resolves.toEqual({ doubled: 6 })
		await expect(resolveStaticSolution({ getStaticSolution: async () => ({ base: 7 }) }, {})).resolves.toEqual({ base: 7 })
	})

	it('returns undefined when no solution generator is defined', async () => {
		await expect(resolveSolution({}, { value: 3 }, undefined, {})).resolves.toBeUndefined()
	})

	it('passes the inputs separately and merges the static and dynamic solutions', async () => {
		type Solution = { base: number, answer: number }
		const getSolution = vi.fn(async (parameters: { extra: number }, inputDependency: number | undefined, staticSolution: Partial<Solution>): Promise<Partial<Solution>> => ({
			answer: Number(staticSolution.base) + Number(inputDependency) + parameters.extra,
		}))
		const definition = { getStaticSolution: () => ({ base: 2 }), getSolution }
		const parameters = { extra: 4 }
		const staticSolution = await resolveStaticSolution(definition, parameters)
		await expect(resolveSolution(definition, parameters, 3, staticSolution)).resolves.toEqual({ base: 2, answer: 9 })
		expect(getSolution).toHaveBeenCalledWith(parameters, 3, staticSolution)
	})
})
