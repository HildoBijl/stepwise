import type { SkillId, SkillSetup } from '@step-wise/skill-setup'

export type { SkillId } from '@step-wise/skill-setup'

// Fundamentals.
export type ModuleId = string
export type ModuleType = 'concept' | 'skill'

// Parameter types.
export type SkillThresholdOptions = {
	mastery: number
	recap: number
	priorKnowledgeMastery: number
	priorKnowledgeRecap: number
}
export type SkillThresholdOptionsInput = Partial<SkillThresholdOptions>
export type SkillLinkDefinition = string | string[] | { skillId?: SkillId | SkillId[]; skillIds?: SkillId[]; correlation?: number }
export type BaseModuleDefinition = {
	name: string
	prerequisites?: ModuleId[]
}

// Module definitions.
export type ConceptDefinition = BaseModuleDefinition & {
	type: 'concept'
}
export type SkillDefinition = BaseModuleDefinition & {
	type: 'skill'
	setup?: SkillSetup<unknown>
	links?: SkillLinkDefinition | SkillLinkDefinition[]
	thresholds?: SkillThresholdOptionsInput
}
export type ModuleDefinition = ConceptDefinition | SkillDefinition
export type ModuleTreeDefinition = { [key: string]: ModuleDefinition | ModuleTreeDefinition }

// Processed modules.
export type SkillLink = { skillIds: SkillId[]; correlation?: number }
export type BaseModule = {
	id: ModuleId
	type: ModuleType
	name: string
	groupPath: string[]
	groupModuleIds: ModuleId[]
	prerequisiteIds: ModuleId[]
	continuationIds: ModuleId[]
}
export type Concept = BaseModule & {
	type: 'concept'
}
export type Skill = BaseModule & {
	id: SkillId
	type: 'skill'
	setup?: SkillSetup<unknown>
	links: SkillLink[]
	linkedSkillIds: SkillId[]
	thresholds: SkillThresholdOptions
}
export type Module = Concept | Skill
export type ModuleTree = Record<ModuleId, Module>
