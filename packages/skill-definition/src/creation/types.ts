import type { SkillId, SkillSetup } from '@step-wise/skill-setup'

export type { SkillId } from '@step-wise/skill-setup'

// Raw skills.
export type SkillThresholdOptions = {
	mastery: number
	recap: number
	priorKnowledgeMastery: number
	priorKnowledgeRecap: number
}
export type SkillThresholdOptionsInput = Partial<SkillThresholdOptions>
export type RawSkillLink = string | string[] | { skillId?: SkillId | SkillId[]; skillIds?: SkillId[]; correlation?: number }
export type RawSkillDefinition = {
	name: string
	setup?: SkillSetup<unknown>
	prerequisites?: SkillId[]
	links?: RawSkillLink | RawSkillLink[]
	thresholds?: SkillThresholdOptionsInput
}
export type RawSkillTree = { [key: string]: RawSkillDefinition | RawSkillTree }

// Processed skills.
export type SkillLink = { skillIds: SkillId[]; correlation?: number }
export type Skill = {
	id: SkillId
	name: string
	groupPath: string[]
	groupSkillIds: SkillId[]
	setup?: SkillSetup<unknown>
	prerequisiteIds: SkillId[]
	continuationIds: SkillId[]
	links: SkillLink[]
	linkedSkillIds: SkillId[]
	thresholds: SkillThresholdOptions
}

// Skill containers.
export type SkillTree = Record<SkillId, Skill>
