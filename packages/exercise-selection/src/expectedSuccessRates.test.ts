import { and, skill } from '@step-wise/skill-setup'
import type { SkillLevelSet } from '@step-wise/skill-tracking'
import { describe, expect, it, vi } from 'vitest'

import { getExpectedExerciseSuccessRates } from './expectedSuccessRates.ts'

describe('getExpectedExerciseSuccessRates', () => {
	it('returns neutral rates without loading skill data when no skills are required', async () => {
		const loadSkillLevelSet = vi.fn()
		await expect(getExpectedExerciseSuccessRates([{}, { weight: 2 }], loadSkillLevelSet)).resolves.toEqual([0.5, 0.5])
		expect(loadSkillLevelSet).not.toHaveBeenCalled()
	})

	it('loads every required skill once and preserves metadata order', async () => {
		const getCombinedSetupExpectedSuccessRate = vi.fn()
			.mockReturnValueOnce(0.6)
			.mockReturnValueOnce(0.7)
			.mockReturnValueOnce(0.8)
		const skillLevelSet = { getCombinedSetupExpectedSuccessRate } as unknown as SkillLevelSet
		const loadSkillLevelSet = vi.fn(async () => skillLevelSet)
		const setup = and('a', 'b')
		const secondSetup = skill('b')

		await expect(getExpectedExerciseSuccessRates([
			{},
			{ skill: 'a' },
			{ setup, setupInferenceOrder: 6 },
			{ skill: 'a', setup: secondSetup, setupInferenceOrder: 4 },
		], loadSkillLevelSet)).resolves.toEqual([0.5, 0.6, 0.7, 0.8])
		expect(loadSkillLevelSet).toHaveBeenCalledWith(['a', 'b'])
		expect(getCombinedSetupExpectedSuccessRate).toHaveBeenNthCalledWith(1, ['a', undefined], [undefined, undefined])
		expect(getCombinedSetupExpectedSuccessRate).toHaveBeenNthCalledWith(2, [undefined, setup], [undefined, 6])
		expect(getCombinedSetupExpectedSuccessRate).toHaveBeenNthCalledWith(3, ['a', secondSetup], [undefined, 4])
	})

	it('validates metadata before loading skill data', async () => {
		const loadSkillLevelSet = vi.fn()
		await expect(getExpectedExerciseSuccessRates([{ weight: -1 }], loadSkillLevelSet)).rejects.toThrow()
		expect(loadSkillLevelSet).not.toHaveBeenCalled()
	})
})
