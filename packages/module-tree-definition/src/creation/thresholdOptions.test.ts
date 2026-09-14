import { describe, expect, it } from 'vitest'

import { defaultSkillThresholdOptions, resolveSkillThresholdOptions } from './thresholdOptions.ts'

describe('resolveSkillThresholdOptions', () => {
	it('provides every default threshold', () => {
		const thresholds = resolveSkillThresholdOptions()
		expect(thresholds.mastery).toBe(0.55)
		expect(thresholds.recap).toBeCloseTo(0.495)
		expect(thresholds.priorKnowledgeMastery).toBe(0.55)
		expect(thresholds.priorKnowledgeRecap).toBeCloseTo(0.44)
		expect(resolveSkillThresholdOptions()).toEqual(defaultSkillThresholdOptions)
	})

	it('derives omitted thresholds from the relevant mastery threshold', () => {
		const thresholds = resolveSkillThresholdOptions({ mastery: 0.6 })
		expect(thresholds.mastery).toBe(0.6)
		expect(thresholds.recap).toBeCloseTo(0.54)
		expect(thresholds.priorKnowledgeMastery).toBe(0.6)
		expect(thresholds.priorKnowledgeRecap).toBeCloseTo(0.48)

		const priorKnowledgeThresholds = resolveSkillThresholdOptions({ mastery: 0.6, priorKnowledgeMastery: 0.7 })
		expect(priorKnowledgeThresholds.mastery).toBe(0.6)
		expect(priorKnowledgeThresholds.recap).toBeCloseTo(0.54)
		expect(priorKnowledgeThresholds.priorKnowledgeMastery).toBe(0.7)
		expect(priorKnowledgeThresholds.priorKnowledgeRecap).toBeCloseTo(0.56)
	})

	it('preserves explicitly supplied thresholds', () => {
		const thresholds = { mastery: 0.7, recap: 0.5, priorKnowledgeMastery: 0.8, priorKnowledgeRecap: 0.6 }
		expect(resolveSkillThresholdOptions(thresholds)).toEqual(thresholds)
	})

	it.each([NaN, -0.1, 1.1, Infinity, '0.5'])('rejects an invalid threshold: %s', mastery => {
		expect(() => resolveSkillThresholdOptions({ mastery } as never)).toThrow()
	})

	it('rejects recap thresholds above their corresponding mastery thresholds', () => {
		expect(() => resolveSkillThresholdOptions({ mastery: 0.5, recap: 0.6 })).toThrow(/recap.*must not exceed/i)
		expect(() => resolveSkillThresholdOptions({ priorKnowledgeMastery: 0.5, priorKnowledgeRecap: 0.6 })).toThrow(/priorKnowledgeRecap.*must not exceed/i)
	})

	it('rejects unsupported options', () => {
		expect(() => resolveSkillThresholdOptions({ pass: 0.5 } as never)).toThrow(/unsupported option/)
	})
})
