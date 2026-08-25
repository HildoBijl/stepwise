import type { Exercise } from '@step-wise/exercise-definition'
import type { SkillLevelSet } from '@step-wise/skill-tracking'

import { selectExercise, selectRandomExercise } from './selectExercise'

const baseExercise = {
	metadata: {},
	generateParameters: () => ({}),
	getInitialState: () => ({}),
}
const soloExercise = { ...baseExercise, processSoloAction: () => ({}) } satisfies Exercise
const groupExercise = { ...baseExercise, processGroupActions: () => ({}) } satisfies Exercise
const dualModeExercise = { ...baseExercise, processSoloAction: () => ({}), processGroupActions: () => ({}) } satisfies Exercise

describe('selectExercise', () => {
	const getSkillLevelSet = async () => ({
		getCombinedSetupExpectedSuccessRate: () => 0.5,
	}) as unknown as SkillLevelSet

	test('only selects exercises that support solo mode', async () => {
		await expect(selectExercise({ groupExercise, soloExercise }, getSkillLevelSet)).resolves.toBe('soloExercise')
	})

	test('accepts a dual-mode exercise', async () => {
		await expect(selectExercise({ dualModeExercise }, getSkillLevelSet)).resolves.toBe('dualModeExercise')
	})

	test('throws when no exercise supports solo mode', async () => {
		await expect(selectExercise({ groupExercise }, getSkillLevelSet)).rejects.toThrow(/mode "solo"/)
	})

	test('keeps the repeat-delay fallback restricted to solo exercises', async () => {
		const previousExercises = [{ exerciseId: 'soloExercise', createdAt: 1, updatedAt: 1 }]
		await expect(selectExercise({ groupExercise, soloExercise }, getSkillLevelSet, previousExercises)).resolves.toBe('soloExercise')
	})
})

describe('selectRandomExercise', () => {
	test('only selects exercises supporting the requested mode', () => {
		expect(selectRandomExercise({ soloExercise, groupExercise }, 'solo')).toBe('soloExercise')
		expect(selectRandomExercise({ soloExercise, groupExercise }, 'group')).toBe('groupExercise')
	})

	test('accepts a dual-mode exercise in either mode', () => {
		expect(selectRandomExercise({ dualModeExercise }, 'solo')).toBe('dualModeExercise')
		expect(selectRandomExercise({ dualModeExercise }, 'group')).toBe('dualModeExercise')
	})

	test('throws when no exercise supports the requested mode', () => {
		expect(() => selectRandomExercise({ soloExercise }, 'group')).toThrow(/mode "group"/)
		expect(() => selectRandomExercise({}, 'solo')).toThrow(/mode "solo"/)
	})
})
