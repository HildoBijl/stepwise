import type { SkillSetup } from '@step-wise/skill-setup'

// Pathing of skills.
export type SkillId = string
export type SkillPath = string[]

// Raw skills.
export type Thresholds = { pass?: number }
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
	path: SkillPath
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
export type SkillsPerGroup = Record<string, SkillId[]>
