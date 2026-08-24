import { describe, expect, it } from 'vitest'

import { type SkillLevelDecayOptions, applySkillLevelDecay } from './decay'

describe('applySkillLevelDecay', () => {
	it('leaves uniform coefficients unchanged', () => {
		expect(applySkillLevelDecay([1], { elapsedTime: 1000, applyPracticeEffect: true })).toEqual([1])
	})

	it('leaves coefficients unchanged without elapsed time or practice effect', () => {
		expect(applySkillLevelDecay([0, 1])).toEqual([0, 1])
	})

	it('moves coefficients towards the uniform prior through time decay', () => {
		const result = applySkillLevelDecay([0, 1], { elapsedTime: 1000, timeDecayHalfLife: 1000 })
		expect(result).not.toEqual([0, 1])
		expect(result).not.toEqual([1])
	})

	it('makes the practice effect weaker after more practice', () => {
		const early = applySkillLevelDecay([0, 1], { applyPracticeEffect: true, practiceCount: 0 })
		const late = applySkillLevelDecay([0, 1], { applyPracticeEffect: true, practiceCount: 100 })
		expect(late[late.length - 1]).toBeGreaterThan(early[early.length - 1])
	})

	it('supports a zero initial practice-decay time', () => {
		expect(applySkillLevelDecay([0, 1], { applyPracticeEffect: true, initialPracticeDecayTime: 0 })).toEqual([0, 1])
	})

	const invalidOptions: [string, SkillLevelDecayOptions][] = [
		['negative elapsed time', { elapsedTime: -1 }],
		['a non-boolean practice flag', { applyPracticeEffect: 1 } as unknown as SkillLevelDecayOptions],
		['a negative practice count', { practiceCount: -1 }],
		['a fractional practice count', { practiceCount: 1.5 }],
		['a zero time half-life', { timeDecayHalfLife: 0 }],
		['a negative initial practice time', { initialPracticeDecayTime: -1 }],
		['a zero practice-count half-life', { practiceCountHalfLife: 0 }],
	]
	it.each(invalidOptions)('rejects %s', (_label, options) => {
		expect(() => applySkillLevelDecay([0, 1], options)).toThrow()
	})

	it('rejects invalid coefficients', () => {
		expect(() => applySkillLevelDecay([0.2, 0.2])).toThrow()
	})
})
