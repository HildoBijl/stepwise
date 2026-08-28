import { describe, expect, it } from 'vitest'

import { skill } from '@step-wise/skill-setup'

import { createStepExerciseMetadata } from './preprocessing.ts'

describe('createStepExerciseMetadata', () => {
	it('keeps the steps and combines their skills into one setup', () => {
		const steps = ['first', undefined, ['second', 'third']]
		const metadata = createStepExerciseMetadata(steps)

		expect(metadata.steps).toBe(steps)
		expect(metadata.setup?.getSkillSet()).toEqual(new Set(['first', 'second', 'third']))
	})

	it('returns no setup when all steps are skill-free', () => {
		expect(createStepExerciseMetadata([undefined, [undefined, undefined]])).toEqual({ steps: [undefined, [undefined, undefined]] })
	})

	it('accepts existing setup instances', () => {
		const setup = skill('first')
		expect(createStepExerciseMetadata([setup]).setup?.getSkillSet()).toEqual(new Set(['first']))
	})

	it('rejects an empty substep array', () => {
		expect(() => createStepExerciseMetadata([[]])).toThrow()
	})

	it('rejects a substep array with only one entry', () => {
		expect(() => createStepExerciseMetadata([[undefined]])).toThrow()
	})

	it('rejects malformed skill setups', () => {
		expect(() => createStepExerciseMetadata([42 as never])).toThrow()
	})
})
