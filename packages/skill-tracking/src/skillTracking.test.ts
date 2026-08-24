import { approximatelyEqual, compareNumberArrays } from '@step-wise/js-utils'
import { type BernsteinCoefficients, getBernsteinExpectedValue } from '@step-wise/bernstein-polynomials'
import { skill, and, or, repeat, pick, part } from '@step-wise/skill-setup'
import { createSkillTree } from '@step-wise/skill-definition'

import type { RawSkillLevel } from './types'
import { SkillLevelSet } from './SkillLevelSet'
import { defaultLinkCorrelation } from './settings'
import { type BernsteinSmoothingOptions, smoothBernsteinCoefficients } from './smoothing'
import { ensureSkillLevel, ensureSkillLevelUpdate, ensureSkillObservation } from './utils'

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

// Set up a helper to create raw skill level objects.
const coefficientsToRawSkillLevel = (coefficients: BernsteinCoefficients, date = now, numPracticed = 0): RawSkillLevel => ({
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
		expect(() => ensureSkillLevel(coefficientsToRawSkillLevel([1], now, numPracticed))).toThrow()
	})

	it('Requires highest coefficients and their date together in updates', () => {
		expect(() => ensureSkillLevelUpdate({ coefficients: [1], coefficientsOn: now, highest: [1], numPracticed: 0 })).toThrow()
		expect(() => ensureSkillLevelUpdate({ coefficients: [1], coefficientsOn: now, highestOn: now, numPracticed: 0 })).toThrow()
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
		const returnedCoefficients = skillLevelSet.getCoefficients('a') as number[]
		returnedCoefficients[0] = 0
		expect(skillLevelSet.getCoefficients('a')).toEqual([1])
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
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1]) })
		expect(() => skillLevelSet.processObservations({} as never)).toThrow()
	})

	it('Validates the complete batch before applying updates', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1]) })
		expect(() => skillLevelSet.processObservations([
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
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, 2) })
		expect(() => skillLevelSet.update({ a: { coefficients: [0, 1], coefficientsOn, numPracticed } })).toThrow(/Conflicting skill level update/)
	})

	it('Allows the practice count to advance within the same millisecond', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, 2) })
		skillLevelSet.update({ a: { coefficients: [0, 1], coefficientsOn: now, numPracticed: 3 } })
		expect(skillLevelSet.getSkillLevel('a').numPracticed).toBe(3)
	})

	it('Rejects a conflicting update set atomically', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, {
			a: coefficientsToRawSkillLevel([1], now, 2),
			b: coefficientsToRawSkillLevel([1], now, 2),
		})
		expect(() => skillLevelSet.update({
			a: { coefficients: [0, 1], coefficientsOn: new Date(now.getTime() + 1), numPracticed: 3 },
			b: { coefficients: [0, 1], coefficientsOn: new Date(now.getTime() - 1), numPracticed: 3 },
		})).toThrow(/Conflicting skill level update/)
		expect(skillLevelSet.getSkillLevel('a').numPracticed).toBe(2)
		expect(skillLevelSet.getSkillLevel('a').coefficients).toEqual([1])
	})
})

describe('Skill level subscriptions:', () => {
	it('Uses an opaque token that only changes when the set changes', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, 2) })
		const initialSnapshot = skillLevelSet.getSnapshot()
		skillLevelSet.update({ a: { coefficients: [0, 1], coefficientsOn: new Date(now.getTime() - 1), numPracticed: 1 } })
		expect(skillLevelSet.getSnapshot()).toBe(initialSnapshot)
		skillLevelSet.update({ a: { coefficients: [0, 1], coefficientsOn: now, numPracticed: 3 } })
		const updatedSnapshot = skillLevelSet.getSnapshot()
		expect(updatedSnapshot).not.toBe(initialSnapshot)
		skillLevelSet.clear()
		expect(skillLevelSet.getSnapshot()).not.toBe(updatedSnapshot)
	})
})

describe('Skill level smoothing:', () => {
	const invalidOptions: [string, BernsteinSmoothingOptions][] = [
		['negative elapsed time', { time: -1 }],
		['a non-boolean practice-decay flag', { applyPracticeDecay: 1 } as unknown as BernsteinSmoothingOptions],
		['a fractional practice count', { numProblemsPracticed: 1.5 }],
		['a zero time-decay half-life', { decayHalfLife: 0 }],
		['a negative initial practice-decay time', { initialPracticeDecayTime: -1 }],
		['a zero practice-decay half-life', { practiceDecayHalfLife: 0 }],
	]

	it.each(invalidOptions)('Rejects %s', (_description, options) => {
		expect(() => smoothBernsteinCoefficients([0, 1], options)).toThrow()
	})

	it('Rejects invalid coefficient arrays', () => {
		expect(() => smoothBernsteinCoefficients([0.2, 0.2])).toThrow()
	})

	it('Treats future coefficient dates as having zero elapsed time', () => {
		const future = new Date(now.getTime() + 60_000)
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([0, 1], future, effectivelyInfinitePracticeCount) })
		expect(skillLevelSet.getCoefficients('a')).toEqual([0, 1])
	})
})

// Run tests for inference of a skill.
describe('Skill inference for elementary skills:', () => {
	it('Skills with flat distributions are not smoothed', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1]) })
		expect(skillLevelSet.getCoefficients('a')).toEqual([1])
		expect(approximatelyEqual(skillLevelSet.getExpectedValue('a'), 1 / 2)).toBe(true)
	})

	it('Skills with infinite practice are not smoothed', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
		expect(skillLevelSet.getCoefficients('a')).toEqual([0, 1])
		expect(approximatelyEqual(skillLevelSet.getExpectedValue('a'), 2 / 3)).toBe(true)
	})

	it('Skills with practice decay are smoothed', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([0, 1]) })
		const expectedValue = skillLevelSet.getExpectedValue('a')
		expect(expectedValue).toBeGreaterThan(1 / 2)
		expect(expectedValue).toBeLessThan(2 / 3)
	})

	it('Skills with time decay are smoothed', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([0, 1], twoMonthsAgo, effectivelyInfinitePracticeCount) })
		const expectedValue = skillLevelSet.getExpectedValue('a')
		expect(expectedValue).toBeGreaterThan(1 / 2)
		expect(expectedValue).toBeLessThan(2 / 3)
	})

	it('Skills with unknown data will throw', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1]) })
		expect(() => skillLevelSet.getCoefficients('b')).toThrow()
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
		const explicitTree = createSkillTree({ a: { name: 'A', links: { skillId: 'b', correlation: defaultLinkCorrelation } }, b: { name: 'B' } })
		const data = { a: coefficientsToRawSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToRawSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) }
		expect(new SkillLevelSet(defaultTree, data).getCoefficients('a')).toEqual(new SkillLevelSet(explicitTree, data).getCoefficients('a'))
	})
})

// Run tests for the inference of a set-up.
describe('Skill inference for set-ups:', () => {
	it('Preserves the uncertainty in the skill distributions', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, effectivelyInfinitePracticeCount) })
		expect(compareNumberArrays(skillLevelSet.getSetupCoefficients(skill('a'), 4), [1 / 5, 1 / 5, 1 / 5, 1 / 5, 1 / 5])).toBe(true)
	})

	it('The and-set-up is properly inferred', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToRawSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
		const setup = and('a', 'b')
		const target = 1 / 3
		expect(approximatelyEqual(skillLevelSet.getSetupExpectedValue(setup), target)).toBe(true)

		const setupCoefficients = skillLevelSet.getSetupCoefficients(setup, inferenceOrder)
		const result = target + 2 / (inferenceOrder + 2) * (1 / 2 - target)
		expect(approximatelyEqual(getBernsteinExpectedValue(setupCoefficients), result)).toBe(true)
	})

	it('The or-set-up is properly inferred', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToRawSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
		const setup = or('a', 'b')
		const target = 5 / 6
		expect(approximatelyEqual(skillLevelSet.getSetupExpectedValue(setup), target)).toBe(true)

		const setupCoefficients = skillLevelSet.getSetupCoefficients(setup, inferenceOrder)
		const result = target + 2 / (inferenceOrder + 2) * (1 / 2 - target)
		expect(approximatelyEqual(getBernsteinExpectedValue(setupCoefficients), result)).toBe(true)
	})

	it('The repeat-set-up is properly inferred', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToRawSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
		const setup = repeat('b', 3)
		const target = 2 / 5
		expect(approximatelyEqual(skillLevelSet.getSetupExpectedValue(setup), target)).toBe(true)

		const setupCoefficients = skillLevelSet.getSetupCoefficients(setup, inferenceOrder)
		const result = target + 2 / (inferenceOrder + 2) * (1 / 2 - target)
		expect(approximatelyEqual(getBernsteinExpectedValue(setupCoefficients), result)).toBe(true)
	})

	it('The pick-set-up is properly inferred', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToRawSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
		const setup = pick(['a', 'b'], 1, [3, 1])
		const target = 13 / 24
		expect(approximatelyEqual(skillLevelSet.getSetupExpectedValue(setup), target)).toBe(true)

		const setupCoefficients = skillLevelSet.getSetupCoefficients(setup, inferenceOrder)
		const result = target + 2 / (inferenceOrder + 2) * (1 / 2 - target)
		expect(approximatelyEqual(getBernsteinExpectedValue(setupCoefficients), result)).toBe(true)
	})

	it('The part-set-up within an and-set-up is properly inferred', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToRawSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
		const setup = and('a', part('b', 3 / 4))
		const target = 3 / 8
		expect(approximatelyEqual(skillLevelSet.getSetupExpectedValue(setup), target)).toBe(true)

		const setupCoefficients = skillLevelSet.getSetupCoefficients(setup, inferenceOrder)
		const result = target + 2 / (inferenceOrder + 2) * (1 / 2 - target)
		expect(approximatelyEqual(getBernsteinExpectedValue(setupCoefficients), result)).toBe(true)
	})

	it('The part-set-up within an or-set-up is properly inferred', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToRawSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
		const setup = or('a', part('b', 3 / 4))
		const target = 3 / 4
		expect(approximatelyEqual(skillLevelSet.getSetupExpectedValue(setup), target)).toBe(true)

		const setupCoefficients = skillLevelSet.getSetupCoefficients(setup, inferenceOrder)
		const result = target + 2 / (inferenceOrder + 2) * (1 / 2 - target)
		expect(approximatelyEqual(getBernsteinExpectedValue(setupCoefficients), result)).toBe(true)
	})

	it('Set-ups with skills with unknown data will throw', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, effectivelyInfinitePracticeCount) })
		const setup = repeat('b', 3)
		expect(() => skillLevelSet.getSetupExpectedValue(setup)).toThrow()
	})
})

// Run tests for the updating of skills.
describe('Skill updates:', () => {
	describe('A skill-observation is properly updated', () => {
		const setup = skill('a')
		it('on a correct observation', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToRawSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
			const result = skillLevelSet.processObservation({ setup, correct: true })
			expect(compareNumberArrays(result.a.coefficients, [0, 1])).toBe(true)
			expect(result).not.toHaveProperty('b')
		})
		it('on an incorrect observation', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToRawSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
			const result = skillLevelSet.processObservation({ setup, correct: false })
			expect(compareNumberArrays(result.a.coefficients, [1, 0])).toBe(true)
			expect(result).not.toHaveProperty('b')
		})
	})

	describe('An and-observation is properly updated', () => {
		const setup = and('a', 'b')
		it('on a correct observation', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToRawSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
			const result = skillLevelSet.processObservation({ setup, correct: true })
			expect(compareNumberArrays(result.a.coefficients, [0, 1])).toBe(true)
			expect(compareNumberArrays(result.b.coefficients, [0, 0, 1])).toBe(true)
		})
		it('on an incorrect observation', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToRawSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
			const result = skillLevelSet.processObservation({ setup, correct: false })
			expect(compareNumberArrays(result.a.coefficients, [3 / 4, 1 / 4])).toBe(true)
			expect(compareNumberArrays(result.b.coefficients, [0, 1 / 2, 1 / 2])).toBe(true)
		})
	})

	describe('An or-observation is properly updated', () => {
		const setup = or('a', 'b')
		it('on a correct observation', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToRawSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
			const result = skillLevelSet.processObservation({ setup, correct: true })
			expect(compareNumberArrays(result.a.coefficients, [2 / 5, 3 / 5])).toBe(true)
			expect(compareNumberArrays(result.b.coefficients, [0, 1 / 5, 4 / 5])).toBe(true)
		})
		it('on an incorrect observation', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToRawSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
			const result = skillLevelSet.processObservation({ setup, correct: false })
			expect(compareNumberArrays(result.a.coefficients, [1, 0])).toBe(true)
			expect(compareNumberArrays(result.b.coefficients, [0, 1, 0])).toBe(true)
		})
	})

	describe('A repeat-observation is properly updated', () => {
		const setup = repeat('b', 3)
		it('on a correct observation', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToRawSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
			const result = skillLevelSet.processObservation({ setup, correct: true })
			expect(result).not.toHaveProperty('a')
			expect(compareNumberArrays(result.b.coefficients, [0, 0, 0, 0, 1])).toBe(true)
		})
		it('on an incorrect observation', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToRawSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
			const result = skillLevelSet.processObservation({ setup, correct: false })
			expect(result).not.toHaveProperty('a')
			expect(compareNumberArrays(result.b.coefficients, [0, 1 / 6, 1 / 3, 1 / 2, 0])).toBe(true)
		})
	})

	describe('Non-deterministic set-ups cannot be used in updates', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, effectivelyInfinitePracticeCount), b: coefficientsToRawSkillLevel([0, 1], now, effectivelyInfinitePracticeCount) })
		it('pick will throw', () => {
			expect(() => skillLevelSet.processObservation({ setup: pick(['a', 'b'], 1, [3, 1]), correct: true })).toThrow()
		})
		it('part (in and) will throw', () => {
			expect(() => skillLevelSet.processObservation({ setup: and('a', part('b', 3 / 4)), correct: true })).toThrow()
		})
		it('part (in or) will throw', () => {
			expect(() => skillLevelSet.processObservation({ setup: or('a', part('b', 3 / 4)), correct: true })).toThrow()
		})
	})

	describe('Updates are automatically stored', () => {
		it('In case of no smoothing afterwards', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], twoMonthsAgo, effectivelyInfinitePracticeCount) })
			skillLevelSet.processObservation({ setup: skill('a'), correct: true })
			const coefficients = skillLevelSet.getCoefficients('a')
			expect(compareNumberArrays(coefficients, [0, 1])).toBe(true)
		})
		it('In case of smoothing afterwards', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1]) })
			skillLevelSet.processObservation({ setup: skill('a'), correct: true })
			const expectedValue = skillLevelSet.getExpectedValue('a')
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
			const rawSkillLevels = {
				a: coefficientsToRawSkillLevel([1], now, effectivelyInfinitePracticeCount),
				b: coefficientsToRawSkillLevel([0, 1], now, effectivelyInfinitePracticeCount),
			}
			const forward = new SkillLevelSet(skillTree, rawSkillLevels).processObservations(observations)
			const backward = new SkillLevelSet(skillTree, rawSkillLevels).processObservations([...observations].reverse())
			expect(compareNumberArrays(forward.a.coefficients, backward.a.coefficients)).toBe(true)
			expect(compareNumberArrays(forward.b.coefficients, backward.b.coefficients)).toBe(true)
		})

		it('Compares only the final result with the previous highest level', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, effectivelyInfinitePracticeCount) })
			const result = skillLevelSet.processObservations([
				{ setup: skill('a'), correct: true },
				{ setup: skill('a'), correct: false },
			])
			expect(result.a).not.toHaveProperty('highest')
			expect(skillLevelSet.getHighestCoefficients('a')).toEqual([1])
		})
	})
})
