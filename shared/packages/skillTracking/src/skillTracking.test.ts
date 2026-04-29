import type { BernsteinCoefficients } from '@step-wise/bernstein-polynomials'
import { and, or, repeat, pick, part } from '@step-wise/skill-setup'
import { processSkillTree } from '@step-wise/skill-definition'

import type { RawSkillLevel } from './types'
import { getSetupExpectedValue } from './inference'
import { SkillLevelSet } from './SkillLevelSet'

// Set up time to be 
const now = new Date()
jest.useFakeTimers().setSystemTime(now)

const rawSkillTree = {
	a: {
		name: 'A',
	},
	b: {
		name: 'B',
	},
}
const skillTree = processSkillTree(rawSkillTree)
console.log(skillTree)

const coefficientsToRawSkillLevel = (coefficients: BernsteinCoefficients): RawSkillLevel => ({
	coefficients,
	coefficientsOn: now,
	highest: coefficients,
	highestOn: now,
	numPracticed: 0,
})

const rawSkillLevelSet = {
	a: coefficientsToRawSkillLevel([1]),
	b: coefficientsToRawSkillLevel([0, 1]),
}
const skillLevelSet = new SkillLevelSet(skillTree, rawSkillLevelSet)

describe('Skill tracking:', () => {
	describe('SkillSetup inference', () => {
		it('for skills with no links', () => {
			expect(skillLevelSet.getCoefficients('a')).toEqual([1])
			// expect(skillLevelSet.getCoefficients('b')).toEqual([0, 1])
			// expect(close(getSetupExpectedValue(and('a', 'b'), getCoefficients), 1 / 3)).toBe(true)
			// expect(close(getSetupExpectedValue(or('a', 'b'), getCoefficients), 5 / 6)).toBe(true)
			// expect(close(getSetupExpectedValue(repeat('b', 3), getCoefficients), 8 / 27)).toBe(true)
			// expect(close(getSetupExpectedValue(and('a', part('b', 3 / 4)), getCoefficients), 3 / 8)).toBe(true)
			// expect(close(getSetupExpectedValue(or('a', part('b', 3 / 4)), getCoefficients), 3 / 4)).toBe(true)
		})
	})
})
