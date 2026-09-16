import { describe, expect, it, vi } from 'vitest'

import { resolveSolution, resolveStaticSolution, resolveUpdatedInputDependency } from './solutions.ts'
import type { UpdateInputDependencyData } from './types.ts'

describe('resolveUpdatedInputDependency', () => {
	it('preserves the previous dependency when no updater is defined', async () => {
		await expect(resolveUpdatedInputDependency({}, {
			parameters: { value: 3 }, previousInputDependency: 2, staticSolution: {}, input: {}, step: 0, context: undefined,
		})).resolves.toBe(2)
	})

	it('passes the complete update context to an asynchronous updater', async () => {
		const data: UpdateInputDependencyData<{ value: number }, { base: number }, number> = { parameters: { value: 3 }, previousInputDependency: 1, staticSolution: { base: 4 }, input: { selected: 2 }, step: 2, context: undefined }
		const updateInputDependency = vi.fn(async ({ input }: UpdateInputDependencyData<{ value: number }, { base: number }, number>) => input.selected as number)
		const definition = { updateInputDependency }
		await expect(resolveUpdatedInputDependency(definition, data)).resolves.toBe(2)
		expect(updateInputDependency).toHaveBeenCalledWith(data)
	})
})

describe('solution resolution', () => {
	it('returns an empty static solution when no static generator is defined', async () => {
		await expect(resolveStaticSolution({}, { value: 3 }, undefined)).resolves.toEqual({})
	})

	it('resolves synchronous and asynchronous static solution generators', async () => {
		await expect(resolveStaticSolution({ getStaticSolution: ({ parameters: { value } }: { parameters: { value: number }, context: undefined }) => ({ doubled: value * 2 }) }, { value: 3 }, undefined)).resolves.toEqual({ doubled: 6 })
		await expect(resolveStaticSolution({ getStaticSolution: async () => ({ base: 7 }) }, {}, undefined)).resolves.toEqual({ base: 7 })
	})

	it('returns undefined when no solution generator is defined', async () => {
		await expect(resolveSolution({}, { value: 3 }, undefined, {}, undefined)).resolves.toBeUndefined()
	})

	it('passes the inputs separately and merges the static and dynamic solutions', async () => {
		type Solution = { base: number, answer: number }
		const getSolution = vi.fn(async ({ parameters, inputDependency, staticSolution }: { parameters: { extra: number }, inputDependency: number | undefined, staticSolution: Partial<Solution>, context: undefined }): Promise<Partial<Solution>> => ({
			answer: Number(staticSolution.base) + Number(inputDependency) + parameters.extra,
		}))
		const definition = { getStaticSolution: () => ({ base: 2 }), getSolution }
		const parameters = { extra: 4 }
		const staticSolution = await resolveStaticSolution(definition, parameters, undefined)
		await expect(resolveSolution(definition, parameters, 3, staticSolution, undefined)).resolves.toEqual({ base: 2, answer: 9 })
		expect(getSolution).toHaveBeenCalledWith({ parameters, inputDependency: 3, staticSolution, context: undefined })
	})
})
