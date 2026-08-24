import type { SkillSetup } from '@step-wise/skill-setup'
import type { BernsteinCoefficients } from '@step-wise/bernstein-polynomials'
import type { SkillId } from '@step-wise/skill-definition'

// Input: how stored SkillLevel data is entered.
export type StoredSkillLevel = {
	coefficients: BernsteinCoefficients
	coefficientsOn: Date
	highest: BernsteinCoefficients
	highestOn: Date
	numPracticed: number
}
export type StoredSkillLevelSet = Record<SkillId, StoredSkillLevel>

// Output: what is returned.
export type SkillLevelData = {
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
export type StoredSkillLevelUpdate = {
	coefficients: BernsteinCoefficients
	coefficientsOn: Date
	highest?: BernsteinCoefficients
	highestOn?: Date
	numPracticed: number
}
export type StoredSkillLevelUpdateSet = Record<SkillId, StoredSkillLevelUpdate>
