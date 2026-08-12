import type { SkillSetup } from '@step-wise/skill-setup'
import type { BernsteinCoefficients } from '@step-wise/bernstein-polynomials'
import type { SkillId } from '@step-wise/skill-definition'

// Input: how raw SkillLevel data is entered.
export type RawSkillLevel = {
	coefficients: BernsteinCoefficients
	coefficientsOn: Date
	highest: BernsteinCoefficients
	highestOn: Date
	numPracticed: number
}
export type RawSkillLevelSet = Record<SkillId, RawSkillLevel>

// Output: what is returned.
export type SkillLevelOutput = {
	skillId: SkillId
	coefficients: BernsteinCoefficients
	coefficientsOn: Date
	highest: BernsteinCoefficients
	highestOn: Date
	numPracticed: number
}

// Observation: what can change the SkillLevel data.
export type SkillObservation = {
	setup: SkillSetup,
	correct: boolean,
}
export type SkillLevelUpdate = {
	coefficients: BernsteinCoefficients
	coefficientsOn: Date
	highest?: BernsteinCoefficients
	highestOn?: Date
	numPracticed: number
}
export type SkillLevelUpdateSet = Record<SkillId, SkillLevelUpdate>
