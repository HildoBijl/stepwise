import { describe, expect, it } from 'vitest'

import type { InputExerciseSolution, StepExerciseMetadata } from '@step-wise/input-exercises'

import summationAndMultiplication1 from './summationAndMultiplication1.ts'
import summationAndMultiplication2 from './summationAndMultiplication2.ts'

function createCheckInputData<TParameters extends Record<string, unknown>, TSolution extends InputExerciseSolution>(metadata: StepExerciseMetadata, parameters: TParameters, solution: TSolution, key: string, value: number) {
	return {
		metadata,
		parameters,
		rawInput: { [key]: { type: 'Integer' as const, value: String(value) } },
		input: { [key]: value },
		solution,
	}
}

describe('summation and multiplication exercises', () => {
	it('checks the field belonging to each step', () => {
		const parameters = { a: 2, b: 3, c: 4 }
		const solution = { order: 1, ab: 6, ans: 10 }
		const check = (key: string, value: number, step: number) => summationAndMultiplication1.checkInput(
			createCheckInputData(summationAndMultiplication1.metadata, parameters, solution, key, value),
			step,
		)

		expect(check('ans', 10, 0)).toBe(true)
		expect(check('order', 1, 1)).toBe(true)
		expect(check('ab', 6, 2)).toBe(true)
		expect(check('ans', 10, 3)).toBe(true)
	})

	it('checks both multiplication substeps independently', () => {
		const parameters = { a: 2, b: 3, c: 4, d: 5 }
		const solution = { order: 1, ab: 6, cd: 20, ans: 26 }
		const check = (key: string, value: number, step: number, substep = 0) => summationAndMultiplication2.checkInput(
			createCheckInputData(summationAndMultiplication2.metadata, parameters, solution, key, value),
			step,
			substep,
		)

		expect(check('order', 1, 1)).toBe(true)
		expect(check('ab', 6, 2, 1)).toBe(true)
		expect(check('cd', 20, 2, 2)).toBe(true)
		expect(check('ans', 26, 3)).toBe(true)
	})
})
