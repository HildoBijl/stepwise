import type { SkillId, SkillSetup } from '@step-wise/skill-setup'

export type { SkillId } from '@step-wise/skill-setup'

// Raw skills.
export type Thresholds = { pass?: number } // Threshold legacy
export type RawSkillLink = string	| string[] | { skill?: SkillId | SkillId[]; skills?: SkillId[]; order?: number; correlation?: number }
export type RawSkill = {
	name: string
	setup?: SkillSetup<unknown>
	prerequisites?: SkillId[]
	links?: RawSkillLink | RawSkillLink[]
	examples?: string | string[]
	exercises?: string | string[]
	thresholds?: Thresholds
}
export type RawSkillGroup = { [key: string]: RawSkill | RawSkillGroup }

// Processed skills.
export type SkillLink = { skills: SkillId[]; order: number }
export type Skill = {
	id: SkillId
	name: string
	path: string[]
	skillsInGroup: SkillId[]
	setup?: SkillSetup<unknown>
	prerequisites: SkillId[]
	continuations: SkillId[]
	links: SkillLink[]
	linkedSkills: SkillId[]
	examples: string[]
	exercises: string[]
	thresholds?: Thresholds
}

// Skill containers.
export type SkillTree = Record<SkillId, Skill>
