import { type Coefficients } from '../coefficients'

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
	coefficients: Coefficients
	coefficientsOn: Date
	highest: Coefficients
	highestOn: Date
	numPracticed: number
}
export type RawSkillDataSet = Record<string, RawSkillData>
