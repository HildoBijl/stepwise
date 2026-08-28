import { skill } from '@step-wise/skill-setup'
import { describe, expect, it } from 'vitest'

import { ensureSkillLevel, ensureSkillObservation, ensureStoredSkillLevelUpdate, getInitialSkillLevel } from './utils.ts'
import { coefficientsToStoredSkillLevel, now } from './testUtils.ts'

describe('getInitialSkillLevel', () => {
	it('returns a uniform stored skill level and copies the date', () => {
		const date = new Date(now)
		const result = getInitialSkillLevel(date)
		expect(result).toEqual({ coefficients: [1], coefficientsOn: now, highest: [1], highestOn: now, numPracticed: 0 })
		expect(result.coefficientsOn).not.toBe(date)
		expect(result.highestOn).not.toBe(date)
	})
})

describe('ensureSkillLevel', () => {
	it('returns defensive copies', () => {
		const coefficients = [1]
		const date = new Date(now)
		const result = ensureSkillLevel({ coefficients, coefficientsOn: date, highest: coefficients, highestOn: date, numPracticed: 2 })
		coefficients[0] = 0
		date.setFullYear(2000)
		expect(result).toEqual(coefficientsToStoredSkillLevel([1], now, 2))
	})

	it.each([
		{ ...coefficientsToStoredSkillLevel([]), label: 'empty coefficients' },
		{ ...coefficientsToStoredSkillLevel([-1, 2]), label: 'negative coefficients' },
		{ ...coefficientsToStoredSkillLevel([0.2, 0.2]), label: 'unnormalized coefficients' },
		{ ...coefficientsToStoredSkillLevel([1]), coefficientsOn: 'invalid', label: 'an invalid date' },
		{ ...coefficientsToStoredSkillLevel([1]), numPracticed: -1, label: 'a negative practice count' },
		{ ...coefficientsToStoredSkillLevel([1]), numPracticed: 1.5, label: 'a fractional practice count' },
	])('rejects $label', ({ label: _label, ...value }) => {
		expect(() => ensureSkillLevel(value)).toThrow()
	})
})

describe('ensureStoredSkillLevelUpdate', () => {
	it('accepts an update without highest data', () => {
		expect(ensureStoredSkillLevelUpdate({ coefficients: [1], coefficientsOn: now, numPracticed: 1 })).toEqual({ coefficients: [1], coefficientsOn: now, numPracticed: 1 })
	})

	it('requires highest and highestOn together', () => {
		expect(() => ensureStoredSkillLevelUpdate({ coefficients: [1], coefficientsOn: now, highest: [1], numPracticed: 1 })).toThrow()
		expect(() => ensureStoredSkillLevelUpdate({ coefficients: [1], coefficientsOn: now, highestOn: now, numPracticed: 1 })).toThrow()
	})
})

describe('ensureSkillObservation', () => {
	it('normalizes a string setup', () => {
		expect(ensureSkillObservation({ setup: 'a', correct: true }).setup).toEqual(skill('a'))
	})

	it.each([null, { setup: {}, correct: true }, { setup: skill('a'), correct: 'true' }])('rejects invalid observation %#', observation => {
		expect(() => ensureSkillObservation(observation)).toThrow()
	})
})
