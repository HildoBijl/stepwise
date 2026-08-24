import { approximatelyEqual, compareNumberArrays } from '@step-wise/js-utils'
import { type BernsteinCoefficients, getBernsteinExpectedValue } from '@step-wise/bernstein-polynomials'
import { skill, and, or, repeat, pick, part } from '@step-wise/skill-setup'
import { createSkillTree } from '@step-wise/skill-definition'

import type { StoredSkillLevel } from './types'
import { SkillLevelSet } from './SkillLevelSet'
import { defaultSkillLinkCorrelation } from './settings'
import { type SkillLevelDecayOptions, applySkillLevelDecay } from './smoothing'
import { ensureSkillLevel, ensureStoredSkillLevelUpdate, ensureSkillObservation } from './utils'

// Set up time parameters to be used in the code.
const now = new Date()
jest.useFakeTimers().setSystemTime(now)
const twoMonthsAgo = new Date(now)
twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)

// Define a mock skill tree.
const rawSkillTree = {
	a: {
		name: 'A',
	},
	b: {
		name: 'B',
	},
}
const skillTree = createSkillTree(rawSkillTree)

// Set up a helper to create stored skill level objects.
const coefficientsToStoredSkillLevel = (coefficients: BernsteinCoefficients, date = now, numPracticed = 0): StoredSkillLevel => ({
	coefficients,
	coefficientsOn: date,
	highest: coefficients,
	highestOn: date,
	numPracticed,
})

// Define other settings.
const inferenceOrder = 10
const effectivelyInfinitePracticeCount = 1_000_000

describe('Skill level validation:', () => {
	it.each([-1, 1.5, Infinity, Number.MAX_SAFE_INTEGER + 1])('Rejects invalid practice count %s', numPracticed => {
		expect(() => ensureSkillLevel(coefficientsToStoredSkillLevel([1], now, numPracticed))).toThrow()
	})

	it('Requires highest coefficients and their date together in updates', () => {
		expect(() => ensureStoredSkillLevelUpdate({ coefficients: [1], coefficientsOn: now, highest: [1], numPracticed: 0 })).toThrow()
		expect(() => ensureStoredSkillLevelUpdate({ coefficients: [1], coefficientsOn: now, highestOn: now, numPracticed: 0 })).toThrow()
	})

	it('Copies mutable input and output values', () => {
		const coefficients = [1]
		const date = new Date(now)
		const skillLevelSet = new SkillLevelSet(skillTree, {
			a: {
				coefficients,
				coefficientsOn: date,
				highest: coefficients,
				highestOn: date,
				numPracticed: 0,
			},
		})
		coefficients[0] = 0
		date.setFullYear(date.getFullYear() - 1)
		const returnedCoefficients = skillLevelSet.getInferredCoefficients('a') as number[]
		returnedCoefficients[0] = 0
		expect(skillLevelSet.getInferredCoefficients('a')).toEqual([1])
		expect(skillLevelSet.getSkillLevel('a').coefficientsOn).toEqual(now)
	})
})

describe('Skill observation validation:', () => {
	it('Normalizes skill setup inputs', () => {
		expect(ensureSkillObservation({ setup: 'a', correct: true }).setup).toEqual(skill('a'))
	})

	it.each([
		null,
		{ setup: {}, correct: true },
		{ setup: skill('a'), correct: 'true' },
	])('Rejects invalid observation %#', observation => {
		expect(() => ensureSkillObservation(observation)).toThrow()
	})

	it('Rejects a non-array observation batch', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1]) })
		expect(() => skillLevelSet.applyObservations({} as never)).toThrow()
	})

	it('Validates the complete batch before applying updates', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1]) })
		expect(() => skillLevelSet.applyObservations([
			{ setup: skill('a'), correct: true },
			{ setup: skill('a'), correct: 'false' } as never,
		])).toThrow()
		expect(skillLevelSet.getSkillLevel('a').numPracticed).toBe(0)
	})
})

describe('Skill level update ordering:', () => {
	it.each([
		['an older date with a higher practice count', new Date(now.getTime() - 1), 3],
		['a newer date with a lower practice count', new Date(now.getTime() + 1), 1],
	])('Rejects %s', (_description, coefficientsOn, numPracticed) => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1], now, 2) })
		expect(() => skillLevelSet.applyUpdates({ a: { coefficients: [0, 1], coefficientsOn, numPracticed } })).toThrow(/Conflicting skill level update/)
	})

	it('Allows the practice count to advance within the same millisecond', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1], now, 2) })
		skillLevelSet.applyUpdates({ a: { coefficients: [0, 1], coefficientsOn: now, numPracticed: 3 } })
		expect(skillLevelSet.getSkillLevel('a').numPracticed).toBe(3)
	})

	it('Rejects a conflicting update set atomically', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, {
			a: coefficientsToStoredSkillLevel([1], now, 2),
			b: coefficientsToStoredSkillLevel([1], now, 2),
		})
		expect(() => skillLevelSet.applyUpdates({
			a: { coefficients: [0, 1], coefficientsOn: new Date(now.getTime() + 1), numPracticed: 3 },
			b: { coefficients: [0, 1], coefficientsOn: new Date(now.getTime() - 1), numPracticed: 3 },
		})).toThrow(/Conflicting skill level update/)
		expect(skillLevelSet.getSkillLevel('a').numPracticed).toBe(2)
		expect(skillLevelSet.getSkillLevel('a').coefficients).toEqual([1])
	})
})

describe('Skill level subscriptions:', () => {
	it('Uses an opaque token that only changes when the set changes', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1], now, 2) })
		const initialSnapshot = skillLevelSet.getSnapshot()
		skillLevelSet.applyUpdates({ a: { coefficients: [0, 1], coefficientsOn: new Date(now.getTime() - 1), numPracticed: 1 } })
		expect(skillLevelSet.getSnapshot()).toBe(initialSnapshot)
		skillLevelSet.applyUpdates({ a: { coefficients: [0, 1], coefficientsOn: now, numPracticed: 3 } })
		const updatedSnapshot = skillLevelSet.getSnapshot()
		expect(updatedSnapshot).not.toBe(initialSnapshot)
		skillLevelSet.clear()
		expect(skillLevelSet.getSnapshot()).not.toBe(updatedSnapshot)
	})
})

describe('Skill level cache invalidation:', () => {
	it('Invalidates dependent inference when an update reuses a coefficient timestamp', () => {
		const linkedSkillTree = createSkillTree({ a: { name: 'A', links: 'b' }, b: { name: 'B' } })
		const skillLevelSet = new SkillLevelSet(linkedSkillTree, {
			a: coefficientsToStoredSkillLevel([1], now, 0),
			b: coefficientsToStoredSkillLevel([1], now, 0),
		})
		jest.setSystemTime(new Date(now.getTime() + 1))
		try {
			const coefficientsBefore = skillLevelSet.getInferredCoefficients('a')
			skillLevelSet.applyUpdates({ b: { coefficients: [0, 1], coefficientsOn: now, numPracticed: 1 } })
			const coefficientsAfter = skillLevelSet.getInferredCoefficients('a')
			expect(compareNumberArrays(coefficientsAfter, coefficientsBefore)).toBe(false)
		} finally {
			jest.setSystemTime(now)
		}
	})
})

describe('Skill level smoothing:', () => {
	const invalidOptions: [string, SkillLevelDecayOptions][] = [
		['negative elapsed time', { elapsedTime: -1 }],
		['a non-boolean practice-decay flag', { applyPracticeEffect: 1 } as unknown as SkillLevelDecayOptions],
		['a fractional practice count', { practiceCount: 1.5 }],
		['a zero time-decay half-life', { timeDecayHalfLife: 0 }],
		['a negative initial practice-decay time', { initialPracticeDecayTime: -1 }],
		['a zero practice-decay half-life', { practiceCountHalfLife: 0 }],
	]

	it.each(invalidOptions)('Rejects %s', (_description, options) => {
		expect(() => applySkillLevelDecay([0, 1], options)).toThrow()
	})

	it('Rejects invalid coefficient arrays', () => {
		expect(() => applySkillLevelDecay([0.2, 0.2])).toThrow()
	})

	it('Treats future coefficient dates as having zero elapsed time', () => {
		const future = new Date(now.getTime() + 60_000)
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([0, 1], future, effectivelyInfinitePracticeCount) })
		expect(skillLevelSet.getInferredCoefficients('a')).toEqual([0, 1])
	})
})

// Run tests for inference of a skill.
describe('Skill inference for elementary skills:', () => {
	it('Skills with flat distributions are not smoothed', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1]) })
		expect(skillLevelSet.getInferredCoefficients('a')).toEqual([1])
		expect(approximatelyEqual(skillLevelSet.getExpectedSuccessRate('a'), 1 / 2)).toBe(true)
	})

	it('Skills with infinite practice are not smoothed', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
		expect(skillLevelSet.getInferredCoefficients('a')).toEqual([0, 1])
		expect(approximatelyEqual(skillLevelSet.getExpectedSuccessRate('a'), 2 / 3)).toBe(true)
	})

	it('Skills with practice decay are smoothed', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([0, 1]) })
		const expectedValue = skillLevelSet.getExpectedSuccessRate('a')
		expect(expectedValue).toBeGreaterThan(1 / 2)
		expect(expectedValue).toBeLessThan(2 / 3)
	})

	it('Skills with time decay are smoothed', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([0, 1], twoMonthsAgo, effectivelyInfinitePracticeCount) })
		const expectedValue = skillLevelSet.getExpectedSuccessRate('a')
		expect(expectedValue).toBeGreaterThan(1 / 2)
		expect(expectedValue).toBeLessThan(2 / 3)
	})

	it('Skills with unknown data will throw', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1]) })
		expect(() => skillLevelSet.getInferredCoefficients('b')).toThrow()
	})
})

describe('Skill link correlations:', () => {
	it('Skill definition leaves an unspecified correlation undefined', () => {
		const linkedTree = createSkillTree({ a: { name: 'A', links: 'b' }, b: { name: 'B' } })
		expect(linkedTree.a.links[0]).toEqual({ skillIds: ['b'] })
		expect(linkedTree.b.links[0]).toEqual({ skillIds: ['a'] })
	})

	it('Skill definition preserves an explicit correlation', () => {
		const linkedTree = createSkillTree({ a: { name: 'A', links: { skillId: 'b', correlation: 0.6 } }, b: { name: 'B' } })
		expect(linkedTree.a.links[0].correlation).toBe(0.6)
		expect(linkedTree.b.links[0].correlation).toBe(0.6)
	})

	it.each([NaN, 0, 1, Infinity])('Skill definition rejects invalid correlation %s', correlation => {
		expect(() => createSkillTree({ a: { name: 'A', links: { skillId: 'b', correlation } }, b: { name: 'B' } })).toThrow()
	})

	it('Skill tracking uses the default correlation when none is specified', () => {
		const defaultTree = createSkillTree({ a: { name: 'A', links: 'b' }, b: { name: 'B' } })
		const explicitTree = createSkillTree({ a: { name: 'A', links: { skillId: 'b', correlation: defaultSkillLinkCorrelation } }, b: { name: 'B' } })
		const data = { a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToStoredSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) }
		expect(new SkillLevelSet(defaultTree, data).getInferredCoefficients('a')).toEqual(new SkillLevelSet(explicitTree, data).getInferredCoefficients('a'))
	})
})

// Run tests for the inference of a set-up.
describe('Skill inference for set-ups:', () => {
	it('Preserves the uncertainty in the skill distributions', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount) })
		expect(compareNumberArrays(skillLevelSet.getSetupInferredCoefficients(skill('a'), 4), [1 / 5, 1 / 5, 1 / 5, 1 / 5, 1 / 5])).toBe(true)
	})

	it('The and-set-up is properly inferred', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToStoredSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
		const setup = and('a', 'b')
		const target = 1 / 3
		expect(approximatelyEqual(skillLevelSet.getSetupExpectedSuccessRate(setup), target)).toBe(true)

		const setupCoefficients = skillLevelSet.getSetupInferredCoefficients(setup, inferenceOrder)
		const result = target + 2 / (inferenceOrder + 2) * (1 / 2 - target)
		expect(approximatelyEqual(getBernsteinExpectedValue(setupCoefficients), result)).toBe(true)
	})

	it('The or-set-up is properly inferred', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToStoredSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
		const setup = or('a', 'b')
		const target = 5 / 6
		expect(approximatelyEqual(skillLevelSet.getSetupExpectedSuccessRate(setup), target)).toBe(true)

		const setupCoefficients = skillLevelSet.getSetupInferredCoefficients(setup, inferenceOrder)
		const result = target + 2 / (inferenceOrder + 2) * (1 / 2 - target)
		expect(approximatelyEqual(getBernsteinExpectedValue(setupCoefficients), result)).toBe(true)
	})

	it('The repeat-set-up is properly inferred', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToStoredSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
		const setup = repeat('b', 3)
		const target = 2 / 5
		expect(approximatelyEqual(skillLevelSet.getSetupExpectedSuccessRate(setup), target)).toBe(true)

		const setupCoefficients = skillLevelSet.getSetupInferredCoefficients(setup, inferenceOrder)
		const result = target + 2 / (inferenceOrder + 2) * (1 / 2 - target)
		expect(approximatelyEqual(getBernsteinExpectedValue(setupCoefficients), result)).toBe(true)
	})

	it('The pick-set-up is properly inferred', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToStoredSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
		const setup = pick(['a', 'b'], 1, [3, 1])
		const target = 13 / 24
		expect(approximatelyEqual(skillLevelSet.getSetupExpectedSuccessRate(setup), target)).toBe(true)

		const setupCoefficients = skillLevelSet.getSetupInferredCoefficients(setup, inferenceOrder)
		const result = target + 2 / (inferenceOrder + 2) * (1 / 2 - target)
		expect(approximatelyEqual(getBernsteinExpectedValue(setupCoefficients), result)).toBe(true)
	})

	it('The part-set-up within an and-set-up is properly inferred', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToStoredSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
		const setup = and('a', part('b', 3 / 4))
		const target = 3 / 8
		expect(approximatelyEqual(skillLevelSet.getSetupExpectedSuccessRate(setup), target)).toBe(true)

		const setupCoefficients = skillLevelSet.getSetupInferredCoefficients(setup, inferenceOrder)
		const result = target + 2 / (inferenceOrder + 2) * (1 / 2 - target)
		expect(approximatelyEqual(getBernsteinExpectedValue(setupCoefficients), result)).toBe(true)
	})

	it('The part-set-up within an or-set-up is properly inferred', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToStoredSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
		const setup = or('a', part('b', 3 / 4))
		const target = 3 / 4
		expect(approximatelyEqual(skillLevelSet.getSetupExpectedSuccessRate(setup), target)).toBe(true)

		const setupCoefficients = skillLevelSet.getSetupInferredCoefficients(setup, inferenceOrder)
		const result = target + 2 / (inferenceOrder + 2) * (1 / 2 - target)
		expect(approximatelyEqual(getBernsteinExpectedValue(setupCoefficients), result)).toBe(true)
	})

	it('Set-ups with skills with unknown data will throw', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount) })
		const setup = repeat('b', 3)
		expect(() => skillLevelSet.getSetupExpectedSuccessRate(setup)).toThrow()
	})
})

// Run tests for the updating of skills.
describe('Skill updates:', () => {
	describe('A skill-observation is properly updated', () => {
		const setup = skill('a')
		it('on a correct observation', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToStoredSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
			const result = skillLevelSet.applyObservation({ setup, correct: true })
			expect(compareNumberArrays(result.a.coefficients, [0, 1])).toBe(true)
			expect(result).not.toHaveProperty('b')
		})
		it('on an incorrect observation', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToStoredSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
			const result = skillLevelSet.applyObservation({ setup, correct: false })
			expect(compareNumberArrays(result.a.coefficients, [1, 0])).toBe(true)
			expect(result).not.toHaveProperty('b')
		})
	})

	describe('An and-observation is properly updated', () => {
		const setup = and('a', 'b')
		it('on a correct observation', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToStoredSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
			const result = skillLevelSet.applyObservation({ setup, correct: true })
			expect(compareNumberArrays(result.a.coefficients, [0, 1])).toBe(true)
			expect(compareNumberArrays(result.b.coefficients, [0, 0, 1])).toBe(true)
		})
		it('on an incorrect observation', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToStoredSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
			const result = skillLevelSet.applyObservation({ setup, correct: false })
			expect(compareNumberArrays(result.a.coefficients, [3 / 4, 1 / 4])).toBe(true)
			expect(compareNumberArrays(result.b.coefficients, [0, 1 / 2, 1 / 2])).toBe(true)
		})
	})

	describe('An or-observation is properly updated', () => {
		const setup = or('a', 'b')
		it('on a correct observation', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToStoredSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
			const result = skillLevelSet.applyObservation({ setup, correct: true })
			expect(compareNumberArrays(result.a.coefficients, [2 / 5, 3 / 5])).toBe(true)
			expect(compareNumberArrays(result.b.coefficients, [0, 1 / 5, 4 / 5])).toBe(true)
		})
		it('on an incorrect observation', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToStoredSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
			const result = skillLevelSet.applyObservation({ setup, correct: false })
			expect(compareNumberArrays(result.a.coefficients, [1, 0])).toBe(true)
			expect(compareNumberArrays(result.b.coefficients, [0, 1, 0])).toBe(true)
		})
	})

	describe('A repeat-observation is properly updated', () => {
		const setup = repeat('b', 3)
		it('on a correct observation', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToStoredSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
			const result = skillLevelSet.applyObservation({ setup, correct: true })
			expect(result).not.toHaveProperty('a')
			expect(compareNumberArrays(result.b.coefficients, [0, 0, 0, 0, 1])).toBe(true)
		})
		it('on an incorrect observation', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToStoredSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
			const result = skillLevelSet.applyObservation({ setup, correct: false })
			expect(result).not.toHaveProperty('a')
			expect(compareNumberArrays(result.b.coefficients, [0, 1 / 6, 1 / 3, 1 / 2, 0])).toBe(true)
		})
	})

	describe('Non-deterministic set-ups cannot be used in updates', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToStoredSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
		it('pick will throw', () => {
			expect(() => skillLevelSet.applyObservation({ setup: pick(['a', 'b'], 1, [3, 1]), correct: true })).toThrow()
		})
		it('part (in and) will throw', () => {
			expect(() => skillLevelSet.applyObservation({ setup: and('a', part('b', 3 / 4)), correct: true })).toThrow()
		})
		it('part (in or) will throw', () => {
			expect(() => skillLevelSet.applyObservation({ setup: or('a', part('b', 3 / 4)), correct: true })).toThrow()
		})
	})

	describe('Updates are automatically stored', () => {
		it('In case of no smoothing afterwards', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1], twoMonthsAgo, effectivelyInfinitePracticeCount) })
			skillLevelSet.applyObservation({ setup: skill('a'), correct: true })
			const coefficients = skillLevelSet.getInferredCoefficients('a')
			expect(compareNumberArrays(coefficients, [0, 1])).toBe(true)
		})
		it('In case of smoothing afterwards', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1]) })
			skillLevelSet.applyObservation({ setup: skill('a'), correct: true })
			const expectedValue = skillLevelSet.getExpectedSuccessRate('a')
			expect(expectedValue).toBeGreaterThan(1 / 2)
			expect(expectedValue).toBeLessThan(2 / 3)
		})
	})

	describe('Multiple observations are processed simultaneously', () => {
		it('Produces the same result regardless of observation order', () => {
			const observations = [
				{ setup: skill('a'), correct: true },
				{ setup: and('a', 'b'), correct: false },
			]
			const storedSkillLevels = {
				a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount),
				b: coefficientsToStoredSkillLevel([0, 1], now, effectivelyInfinitePracticeCount),
			}
			const forward = new SkillLevelSet(skillTree, storedSkillLevels).applyObservations(observations)
			const backward = new SkillLevelSet(skillTree, storedSkillLevels).applyObservations([...observations].reverse())
			expect(compareNumberArrays(forward.a.coefficients, backward.a.coefficients)).toBe(true)
			expect(compareNumberArrays(forward.b.coefficients, backward.b.coefficients)).toBe(true)
		})

		it('Compares only the final result with the previous highest level', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToStoredSkillLevel([1], now, effectivelyInfinitePracticeCount) })
			const result = skillLevelSet.applyObservations([
				{ setup: skill('a'), correct: true },
				{ setup: skill('a'), correct: false },
			])
			expect(result.a).not.toHaveProperty('highest')
			expect(skillLevelSet.getInferredHighestCoefficients('a')).toEqual([1])
		})
	})
})
