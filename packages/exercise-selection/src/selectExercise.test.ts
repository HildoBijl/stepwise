import type { Exercise } from '@step-wise/exercise-definition'
import type { SkillLevelSet } from '@step-wise/skill-tracking'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { getSelectionProbabilities, selectRandomExercise, selectSkillBasedExercise } from './selectExercise.ts'

const baseExercise = { metadata: {}, generateParameters: () => ({}), getInitialState: () => ({}) }
const soloExercise = { ...baseExercise, processSoloAction: () => ({}) } satisfies Exercise
const groupExercise = { ...baseExercise, processGroupActions: () => ({}) } satisfies Exercise
const dualModeExercise = { ...baseExercise, processSoloAction: () => ({}), processGroupActions: () => ({}) } satisfies Exercise
const loadSkillLevelSet = async () => ({ getCombinedSetupExpectedSuccessRate: () => 0.5 }) as unknown as SkillLevelSet

afterEach(() => vi.restoreAllMocks())

describe('getSelectionProbabilities', () => {
	it('returns normalized probabilities centered on the target success rate', () => {
		const probabilities = getSelectionProbabilities([0.4, 0.5, 0.6])
		expect(probabilities.reduce((total, probability) => total + probability, 0)).toBeCloseTo(1)
		expect(probabilities[0]).toBeGreaterThan(probabilities[1])
		expect(probabilities[1]).toBeGreaterThan(probabilities[2])
	})

	it('applies weights and excludes scores below the threshold', () => {
		expect(getSelectionProbabilities([0.4, 0.4], [0, 2])).toEqual([0, 1])
		expect(getSelectionProbabilities([0.4, 1])).toEqual([1, 0])
	})

	it.each([
		[[], undefined],
		[[-0.1], undefined],
		[[1.1], undefined],
		[[0.5], []],
		[[0.5], [-1]],
		[[0.5], [Infinity]],
		[[0.5], [0]],
	])('rejects invalid success rates or weights %#', (successRates, weights) => {
		expect(() => getSelectionProbabilities(successRates, weights)).toThrow()
	})
})

describe('selectSkillBasedExercise', () => {
	it('only selects solo-capable exercises', async () => {
		await expect(selectSkillBasedExercise({ groupExercise, soloExercise }, loadSkillLevelSet)).resolves.toBe('soloExercise')
		await expect(selectSkillBasedExercise({ dualModeExercise }, loadSkillLevelSet)).resolves.toBe('dualModeExercise')
	})

	it('respects repeat preferences when another candidate remains', async () => {
		const repeatedExercise = { ...soloExercise, metadata: { repeatAfter: 2 } }
		const previousExercises = [{ exerciseId: 'repeated', createdAt: new Date('2026-01-02') }]
		await expect(selectSkillBasedExercise({ repeated: repeatedExercise, alternative: soloExercise }, loadSkillLevelSet, previousExercises)).resolves.toBe('alternative')
	})

	it('falls back to compatible exercises when every repeat preference blocks selection', async () => {
		const repeatedExercise = { ...soloExercise, metadata: { repeatAfter: 2 } }
		const previousExercises = [{ exerciseId: 'repeated', createdAt: new Date('2026-01-02') }]
		await expect(selectSkillBasedExercise({ repeated: repeatedExercise, groupExercise }, loadSkillLevelSet, previousExercises)).resolves.toBe('repeated')
	})

	it('uses resolved exercise weights', async () => {
		vi.spyOn(Math, 'random').mockReturnValue(0.5)
		const excluded = { ...soloExercise, metadata: { weight: 0 } }
		await expect(selectSkillBasedExercise({ excluded, selected: soloExercise }, loadSkillLevelSet)).resolves.toBe('selected')
	})

	it('rejects invalid collections and collections without solo exercises', async () => {
		await expect(selectSkillBasedExercise({ groupExercise }, loadSkillLevelSet)).rejects.toThrow(/mode "solo"/)
		await expect(selectSkillBasedExercise([] as never, loadSkillLevelSet)).rejects.toThrow(TypeError)
	})
})

describe('selectRandomExercise', () => {
	it('only selects exercises supporting the requested mode', () => {
		expect(selectRandomExercise({ soloExercise, groupExercise }, 'solo')).toBe('soloExercise')
		expect(selectRandomExercise({ soloExercise, groupExercise }, 'group')).toBe('groupExercise')
	})

	it('accepts dual-mode exercises and respects weights', () => {
		vi.spyOn(Math, 'random').mockReturnValue(0.5)
		const excluded = { ...dualModeExercise, metadata: { weight: 0 } }
		expect(selectRandomExercise({ excluded, selected: dualModeExercise }, 'solo')).toBe('selected')
		expect(selectRandomExercise({ excluded, selected: dualModeExercise }, 'group')).toBe('selected')
	})

	it('rejects empty or mode-incompatible collections', () => {
		expect(() => selectRandomExercise({ soloExercise }, 'group')).toThrow(/mode "group"/)
		expect(() => selectRandomExercise({}, 'solo')).toThrow(/mode "solo"/)
	})
})
