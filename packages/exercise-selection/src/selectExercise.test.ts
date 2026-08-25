import type { Exercise } from '@step-wise/exercise-definition'
import type { SkillLevelSet } from '@step-wise/skill-tracking'

import { selectRandomExercise, selectSkillBasedExercise } from './selectExercise'

const baseExercise = {
	metadata: {},
	generateParameters: () => ({}),
	getInitialState: () => ({}),
}
const soloExercise = { ...baseExercise, processSoloAction: () => ({}) } satisfies Exercise
const groupExercise = { ...baseExercise, processGroupActions: () => ({}) } satisfies Exercise
const dualModeExercise = { ...baseExercise, processSoloAction: () => ({}), processGroupActions: () => ({}) } satisfies Exercise

describe('selectSkillBasedExercise', () => {
	const loadSkillLevelSet = async () => ({
		getCombinedSetupExpectedSuccessRate: () => 0.5,
	}) as unknown as SkillLevelSet

	test('only selects exercises that support solo mode', async () => {
		await expect(selectSkillBasedExercise({ groupExercise, soloExercise }, loadSkillLevelSet)).resolves.toBe('soloExercise')
	})

	test('accepts a dual-mode exercise', async () => {
		await expect(selectSkillBasedExercise({ dualModeExercise }, loadSkillLevelSet)).resolves.toBe('dualModeExercise')
	})

	test('throws when no exercise supports solo mode', async () => {
		await expect(selectSkillBasedExercise({ groupExercise }, loadSkillLevelSet)).rejects.toThrow(/mode "solo"/)
	})

	test('keeps the repeat-delay fallback restricted to solo exercises', async () => {
		const previousExercises = [{ exerciseId: 'soloExercise', createdAt: new Date() }]
		await expect(selectSkillBasedExercise({ groupExercise, soloExercise }, loadSkillLevelSet, previousExercises)).resolves.toBe('soloExercise')
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
