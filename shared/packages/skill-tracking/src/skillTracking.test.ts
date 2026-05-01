import { compareNumbers, compareNumberArrays } from '@step-wise/utils'
import { type BernsteinCoefficients, getBernsteinExpectedValue } from '@step-wise/bernstein-polynomials'
import { Skill, and, or, repeat, pick, part } from '@step-wise/skill-setup'
import { processSkillTree } from '@step-wise/skill-definition'

import type { RawSkillLevel } from './types'
import { SkillLevelSet } from './SkillLevelSet'

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
const skillTree = processSkillTree(rawSkillTree)

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

// Run tests for inference of a skill.
describe('Skill inference for elementary skills:', () => {
	it('Skills with flat distributions are not smoothed', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1]) })
		expect(skillLevelSet.getCoefficients('a')).toEqual([1])
		expect(compareNumbers(skillLevelSet.getExpectedValue('a'), 1 / 2)).toBe(true)
	})

	it('Skills with infinite practice are not smoothed', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([0, 1], now, Infinity) })
		expect(skillLevelSet.getCoefficients('a')).toEqual([0, 1])
		expect(compareNumbers(skillLevelSet.getExpectedValue('a'), 2 / 3)).toBe(true)
	})

	it('Skills with practice decay are smoothed', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([0, 1]) })
		const expectedValue = skillLevelSet.getExpectedValue('a')
		expect(expectedValue).toBeGreaterThan(1 / 2)
		expect(expectedValue).toBeLessThan(2 / 3)
	})

	it('Skills with time decay are smoothed', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([0, 1], twoMonthsAgo, Infinity) })
		const expectedValue = skillLevelSet.getExpectedValue('a')
		expect(expectedValue).toBeGreaterThan(1 / 2)
		expect(expectedValue).toBeLessThan(2 / 3)
	})

	it('Skills with unknown data will throw', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1]) })
		expect(() => skillLevelSet.getCoefficients('b')).toThrow()
	})
})

// Run tests for the inference of a set-up.
describe('Skill inference for set-ups:', () => {
	it('The and-set-up is properly inferred', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, Infinity), b: coefficientsToRawSkillLevel([0, 1], now, Infinity) })
		const setup = and('a', 'b')
		const target = 1 / 3
		expect(compareNumbers(skillLevelSet.getSetupExpectedValue(setup), target)).toBe(true)

		const setupCoefficients = skillLevelSet.getSetupCoefficients(setup, inferenceOrder)
		const result = target + 2 / (inferenceOrder + 2) * (1 / 2 - target)
		expect(compareNumbers(getBernsteinExpectedValue(setupCoefficients), result)).toBe(true)
	})

	it('The or-set-up is properly inferred', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, Infinity), b: coefficientsToRawSkillLevel([0, 1], now, Infinity) })
		const setup = or('a', 'b')
		const target = 5 / 6
		expect(compareNumbers(skillLevelSet.getSetupExpectedValue(setup), target)).toBe(true)

		const setupCoefficients = skillLevelSet.getSetupCoefficients(setup, inferenceOrder)
		const result = target + 2 / (inferenceOrder + 2) * (1 / 2 - target)
		expect(compareNumbers(getBernsteinExpectedValue(setupCoefficients), result)).toBe(true)
	})

	it('The repeat-set-up is properly inferred', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, Infinity), b: coefficientsToRawSkillLevel([0, 1], now, Infinity) })
		const setup = repeat('b', 3)
		const target = 2 / 5
		expect(compareNumbers(skillLevelSet.getSetupExpectedValue(setup), target)).toBe(true)

		const setupCoefficients = skillLevelSet.getSetupCoefficients(setup, inferenceOrder)
		const result = target + 2 / (inferenceOrder + 2) * (1 / 2 - target)
		expect(compareNumbers(getBernsteinExpectedValue(setupCoefficients), result)).toBe(true)
	})

	it('The pick-set-up is properly inferred', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, Infinity), b: coefficientsToRawSkillLevel([0, 1], now, Infinity) })
		const setup = pick(['a', 'b'], 1, [3, 1])
		const target = 13 / 24
		expect(compareNumbers(skillLevelSet.getSetupExpectedValue(setup), target)).toBe(true)

		const setupCoefficients = skillLevelSet.getSetupCoefficients(setup, inferenceOrder)
		const result = target + 2 / (inferenceOrder + 2) * (1 / 2 - target)
		expect(compareNumbers(getBernsteinExpectedValue(setupCoefficients), result)).toBe(true)
	})

	it('The part-set-up within an and-set-up is properly inferred', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, Infinity), b: coefficientsToRawSkillLevel([0, 1], now, Infinity) })
		const setup = and('a', part('b', 3 / 4))
		const target = 3 / 8
		expect(compareNumbers(skillLevelSet.getSetupExpectedValue(setup), target)).toBe(true)

		const setupCoefficients = skillLevelSet.getSetupCoefficients(setup, inferenceOrder)
		const result = target + 2 / (inferenceOrder + 2) * (1 / 2 - target)
		expect(compareNumbers(getBernsteinExpectedValue(setupCoefficients), result)).toBe(true)
	})

	it('The part-set-up within an or-set-up is properly inferred', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, Infinity), b: coefficientsToRawSkillLevel([0, 1], now, Infinity) })
		const setup = or('a', part('b', 3 / 4))
		const target = 3 / 4
		expect(compareNumbers(skillLevelSet.getSetupExpectedValue(setup), target)).toBe(true)

		const setupCoefficients = skillLevelSet.getSetupCoefficients(setup, inferenceOrder)
		const result = target + 2 / (inferenceOrder + 2) * (1 / 2 - target)
		expect(compareNumbers(getBernsteinExpectedValue(setupCoefficients), result)).toBe(true)
	})

	it('Set-ups with skills with unknown data will throw', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, Infinity) })
		const setup = repeat('b', 3)
		expect(() => skillLevelSet.getSetupExpectedValue(setup)).toThrow()
	})
})

// Run tests for the updating of skills.
describe('Skill updates:', () => {
	describe('A skill-observation is properly updated', () => {
		const setup = new Skill('a')
		it('on a correct observation', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, Infinity), b: coefficientsToRawSkillLevel([0, 1], now, Infinity) })
			const result = skillLevelSet.processObservation({ setup, correct: true })
			expect(compareNumberArrays(result.a.coefficients, [0, 1])).toBe(true)
			expect(result).not.toHaveProperty('b')
		})
		it('on an incorrect observation', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, Infinity), b: coefficientsToRawSkillLevel([0, 1], now, Infinity) })
			const result = skillLevelSet.processObservation({ setup, correct: false })
			expect(compareNumberArrays(result.a.coefficients, [1, 0])).toBe(true)
			expect(result).not.toHaveProperty('b')
		})
	})

	describe('An and-observation is properly updated', () => {
		const setup = and('a', 'b')
		it('on a correct observation', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, Infinity), b: coefficientsToRawSkillLevel([0, 1], now, Infinity) })
			const result = skillLevelSet.processObservation({ setup, correct: true })
			expect(compareNumberArrays(result.a.coefficients, [0, 1])).toBe(true)
			expect(compareNumberArrays(result.b.coefficients, [0, 0, 1])).toBe(true)
		})
		it('on an incorrect observation', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, Infinity), b: coefficientsToRawSkillLevel([0, 1], now, Infinity) })
			const result = skillLevelSet.processObservation({ setup, correct: false })
			expect(compareNumberArrays(result.a.coefficients, [3 / 4, 1 / 4])).toBe(true)
			expect(compareNumberArrays(result.b.coefficients, [0, 1 / 2, 1 / 2])).toBe(true)
		})
	})

	describe('An or-observation is properly updated', () => {
		const setup = or('a', 'b')
		it('on a correct observation', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, Infinity), b: coefficientsToRawSkillLevel([0, 1], now, Infinity) })
			const result = skillLevelSet.processObservation({ setup, correct: true })
			expect(compareNumberArrays(result.a.coefficients, [2 / 5, 3 / 5])).toBe(true)
			expect(compareNumberArrays(result.b.coefficients, [0, 1 / 5, 4 / 5])).toBe(true)
		})
		it('on an incorrect observation', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, Infinity), b: coefficientsToRawSkillLevel([0, 1], now, Infinity) })
			const result = skillLevelSet.processObservation({ setup, correct: false })
			expect(compareNumberArrays(result.a.coefficients, [1, 0])).toBe(true)
			expect(compareNumberArrays(result.b.coefficients, [0, 1, 0])).toBe(true)
		})
	})

	describe('A repeat-observation is properly updated', () => {
		const setup = repeat('b', 3)
		it('on a correct observation', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, Infinity), b: coefficientsToRawSkillLevel([0, 1], now, Infinity) })
			const result = skillLevelSet.processObservation({ setup, correct: true })
			expect(result).not.toHaveProperty('a')
			expect(compareNumberArrays(result.b.coefficients, [0, 0, 0, 0, 1])).toBe(true)
		})
		it('on an incorrect observation', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, Infinity), b: coefficientsToRawSkillLevel([0, 1], now, Infinity) })
			const result = skillLevelSet.processObservation({ setup, correct: false })
			expect(result).not.toHaveProperty('a')
			expect(compareNumberArrays(result.b.coefficients, [0, 1 / 6, 1 / 3, 1 / 2, 0])).toBe(true)
		})
	})

	describe('Non-deterministic set-ups cannot be used in updates', () => {
		const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], now, Infinity), b: coefficientsToRawSkillLevel([0, 1], now, Infinity) })
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
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1], twoMonthsAgo, Infinity) })
			skillLevelSet.processObservation({ setup: new Skill('a'), correct: true })
			const coefficients = skillLevelSet.getCoefficients('a')
			expect(compareNumberArrays(coefficients, [0, 1])).toBe(true)
		})
		it('In case of smoothing afterwards', () => {
			const skillLevelSet = new SkillLevelSet(skillTree, { a: coefficientsToRawSkillLevel([1]) })
			skillLevelSet.processObservation({ setup: new Skill('a'), correct: true })
			const expectedValue = skillLevelSet.getExpectedValue('a')
			expect(expectedValue).toBeGreaterThan(1 / 2)
			expect(expectedValue).toBeLessThan(2 / 3)
		})
	})
})
