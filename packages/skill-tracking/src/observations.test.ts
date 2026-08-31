import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { compareNumberArrays } from '@step-wise/js-utils'
import { and, or, part, pick, repeat, skill } from '@step-wise/skill-setup'

import { SkillLevelSet } from './SkillLevelSet.ts'
import { coefficientsToStoredSkillLevel, effectivelyInfinitePracticeCount, now, skillTree } from './testUtils.ts'

const createLevels = () => new SkillLevelSet(skillTree, {
	a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount),
	b: coefficientsToStoredSkillLevel([0, 1], now, effectivelyInfinitePracticeCount),
})

beforeEach(() => vi.useFakeTimers().setSystemTime(now))
afterEach(() => vi.useRealTimers())

describe('individual observations', () => {
	it.each([
		['skill success', skill('a'), true, [0, 1], undefined],
		['skill failure', skill('a'), false, [1, 0], undefined],
		['and success', and('a', 'b'), true, [0, 1], [0, 0, 1]],
		['and failure', and('a', 'b'), false, [3 / 4, 1 / 4], [0, 1 / 2, 1 / 2]],
		['or success', or('a', 'b'), true, [2 / 5, 3 / 5], [0, 1 / 5, 4 / 5]],
		['or failure', or('a', 'b'), false, [1, 0], [0, 1, 0]],
		['repeat success', repeat('b', 3), true, undefined, [0, 0, 0, 0, 1]],
		['repeat failure', repeat('b', 3), false, undefined, [0, 1 / 6, 1 / 3, 1 / 2, 0]],
	])('applies %s', (_description, setup, correct, expectedA, expectedB) => {
		const result = createLevels().applyObservation({ setup, correct })
		if (expectedA) expect(compareNumberArrays(result.a.coefficients, expectedA)).toBe(true)
		else expect(result).not.toHaveProperty('a')
		if (expectedB) expect(compareNumberArrays(result.b.coefficients, expectedB)).toBe(true)
		else expect(result).not.toHaveProperty('b')
	})

	it.each([
		pick(['a', 'b'], 1),
		and('a', part('b', 3 / 4)),
		or('a', part('b', 3 / 4)),
	])('rejects stochastic setups', setup => {
		expect(() => createLevels().applyObservation({ setup, correct: true })).toThrow(/deterministic/)
	})

	it('rejects observations whose required skill data is unavailable', () => {
		const levels = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1]) })
		expect(() => levels.applyObservation({ setup: skill('b'), correct: true })).toThrow(/not been loaded/)
	})
})

describe('observation batches', () => {
	it('returns no updates for an empty batch', () => {
		expect(createLevels().applyObservations([])).toEqual({})
	})

	it('processes observations simultaneously and independently of their order', () => {
		const observations = [
			{ setup: skill('a'), correct: true },
			{ setup: and('a', 'b'), correct: false },
		]
		const forward = createLevels().applyObservations(observations)
		const backward = createLevels().applyObservations([...observations].reverse())
		expect(compareNumberArrays(forward.a.coefficients, backward.a.coefficients)).toBe(true)
		expect(compareNumberArrays(forward.b.coefficients, backward.b.coefficients)).toBe(true)
		expect(forward.a.numPracticed).toBe(effectivelyInfinitePracticeCount + 2)
		expect(forward.b.numPracticed).toBe(effectivelyInfinitePracticeCount + 1)
	})

	it('validates the complete batch before applying anything', () => {
		const levels = createLevels()
		expect(() => levels.applyObservations([
			{ setup: skill('a'), correct: true },
			{ setup: skill('a'), correct: 'false' } as never,
		])).toThrow()
		expect(levels.getSkillLevel('a').numPracticed).toBe(effectivelyInfinitePracticeCount)
	})

	it('compares only the final batch result with the previous highest level', () => {
		const levels = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount) })
		const result = levels.applyObservations([
			{ setup: skill('a'), correct: true },
			{ setup: skill('a'), correct: false },
		])
		expect(result.a).not.toHaveProperty('highest')
		expect(levels.getInferredHighestCoefficients('a')).toEqual([1])
	})

	it('stores and returns a genuinely new highest level', () => {
		const levels = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount) })
		const result = levels.applyObservation({ setup: skill('a'), correct: true })
		expect(result.a.highest).toBeDefined()
		expect(result.a.highestOn).toEqual(now)
		expect(levels.getHighestExpectedSuccessRate('a')).toBeGreaterThan(1 / 2)
	})
})
