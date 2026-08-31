import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getBernsteinExpectedValue } from '@step-wise/bernstein-polynomials'
import { approximatelyEqual, compareNumberArrays } from '@step-wise/js-utils'
import { createSkillTree } from '@step-wise/skill-definition'
import { and, or, part, pick, repeat, skill } from '@step-wise/skill-setup'

import { SkillLevelSet } from './SkillLevelSet.ts'
import { defaultSkillLinkCorrelation } from './settings.ts'
import { coefficientsToStoredSkillLevel, effectivelyInfinitePracticeCount, now, skillTree, twoMonthsAgo } from './testUtils.ts'

beforeEach(() => vi.useFakeTimers().setSystemTime(now))
afterEach(() => vi.useRealTimers())

describe('elementary skill inference', () => {
	it('keeps a uniform distribution uniform', () => {
		const levels = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1]) })
		expect(levels.getInferredCoefficients('a')).toEqual([1])
		expect(levels.getExpectedSuccessRate('a')).toBe(1 / 2)
	})

	it('applies practice decay', () => {
		const levels = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([0, 1]) })
		const expectedSuccessRate = levels.getExpectedSuccessRate('a')
		expect(expectedSuccessRate).toBeGreaterThan(1 / 2)
		expect(expectedSuccessRate).toBeLessThan(2 / 3)
	})

	it('applies time decay', () => {
		const levels = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([0, 1], twoMonthsAgo, effectivelyInfinitePracticeCount) })
		const expectedSuccessRate = levels.getExpectedSuccessRate('a')
		expect(expectedSuccessRate).toBeGreaterThan(1 / 2)
		expect(expectedSuccessRate).toBeLessThan(2 / 3)
	})

	it('treats future dates as zero elapsed time', () => {
		const future = new Date(now.getTime() + 1000)
		const levels = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([0, 1], future, effectivelyInfinitePracticeCount) })
		expect(levels.getInferredCoefficients('a')).toEqual([0, 1])
	})
})

describe('setup inference', () => {
	const levels = () => new SkillLevelSet(skillTree, {
		a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount),
		b: coefficientsToStoredSkillLevel([0, 1], now, effectivelyInfinitePracticeCount),
	})

	it.each([
		['and', and('a', 'b'), 1 / 3],
		['or', or('a', 'b'), 5 / 6],
		['repeat', repeat('b', 3), 2 / 5],
		['pick', pick(['a', 'b'], 1, [3, 1]), 13 / 24],
		['part within and', and('a', part('b', 3 / 4)), 3 / 8],
		['part within or', or('a', part('b', 3 / 4)), 3 / 4],
	])('calculates the expected success rate for %s', (_label, setup, expected) => {
		expect(approximatelyEqual(levels().getSetupExpectedSuccessRate(setup), expected as number)).toBe(true)
	})

	it('preserves uncertainty instead of substituting only the mean', () => {
		const uniformLevels = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount) })
		expect(compareNumberArrays(uniformLevels.getSetupInferredCoefficients(skill('a'), 4), [1 / 5, 1 / 5, 1 / 5, 1 / 5, 1 / 5])).toBe(true)
	})

	it('infers a representative six-skill nested setup', () => {
		const sixSkillTree = createSkillTree(Object.fromEntries(['a', 'b', 'c', 'd', 'e', 'f'].map(id => [id, { name: id.toUpperCase() }])))
		const storedLevels = Object.fromEntries(Object.keys(sixSkillTree).map(id => [id, coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount)]))
		const setup = and(or('a', 'b'), or('c', 'd'), or('e', 'f'))
		const coefficients = new SkillLevelSet(sixSkillTree, storedLevels).getSetupInferredCoefficients(setup, 4)
		expect(coefficients).toHaveLength(5)
		expect(approximatelyEqual(coefficients.reduce((sum, coefficient) => sum + coefficient, 0), 1)).toBe(true)
	})

	it('combines multiple setup distributions', () => {
		const skillLevels = levels()
		const coefficients = skillLevels.getCombinedSetupCoefficients([skill('a'), skill('b')], [4, 6])
		expect(skillLevels.getCombinedSetupExpectedSuccessRate([skill('a'), skill('b')], [4, 6])).toBe(getBernsteinExpectedValue(coefficients))
	})

	it('throws when required skill data is missing', () => {
		const incomplete = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1]) })
		expect(() => incomplete.getSetupExpectedSuccessRate(skill('b'))).toThrow()
	})
})

describe('skill-tree inference', () => {
	it('infers coefficients from prerequisites', () => {
		const tree = createSkillTree({ a: { name: 'A', setup: skill('b') }, b: { name: 'B' } })
		const levels = new SkillLevelSet(tree, {
			a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount),
			b: coefficientsToStoredSkillLevel([0, 1], now, effectivelyInfinitePracticeCount),
		})
		expect(levels.getExpectedSuccessRate('a')).toBeGreaterThan(1 / 2)
	})

	it('uses the default correlation when none is specified', () => {
		const defaultTree = createSkillTree({ a: { name: 'A', links: 'b' }, b: { name: 'B' } })
		const explicitTree = createSkillTree({ a: { name: 'A', links: { skillId: 'b', correlation: defaultSkillLinkCorrelation } }, b: { name: 'B' } })
		const data = { a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToStoredSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) }
		expect(new SkillLevelSet(defaultTree, data).getInferredCoefficients('a')).toEqual(new SkillLevelSet(explicitTree, data).getInferredCoefficients('a'))
	})

	it('combines a group of correlated skills', () => {
		const tree = createSkillTree({ a: { name: 'A', links: [{ skillIds: ['b', 'c'], correlation: 0.5 }] }, b: { name: 'B' }, c: { name: 'C' } })
		const levels = new SkillLevelSet(tree, {
			a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount),
			b: coefficientsToStoredSkillLevel([0, 1], now, effectivelyInfinitePracticeCount),
			c: coefficientsToStoredSkillLevel([0, 1], now, effectivelyInfinitePracticeCount),
		})
		expect(levels.getExpectedSuccessRate('a')).toBeGreaterThan(1 / 2)
	})
})
