import { type BernsteinCoefficients } from '@step-wise/bernstein-polynomials'

import { type SkillSetup } from '../setup'

// Define how the Skill Tree is formatted.
export type SkillLike = {
	id: string
	setup?: SkillSetup
	prerequisites?: string[]
	links?: SkillLink[]
	linkedSkills?: string[]
	inferenceOrder?: number
}
export type SkillLink = {
	skills: string[]
	order: number
}
export type SkillTree = Record<string, SkillLike>

// Define how raw SkillData is entered.
export type RawSkillData = {
	coefficients: BernsteinCoefficients
	coefficientsOn: Date
	highest: BernsteinCoefficients
	highestOn: Date
	numPracticed: number
}
export type RawSkillDataSet = Record<string, RawSkillData>

export type SkillDataOutput = {
	skillId: string
	coefficients: BernsteinCoefficients
	highest: BernsteinCoefficients
	lastPracticed: Date
	numPracticed: number
}
