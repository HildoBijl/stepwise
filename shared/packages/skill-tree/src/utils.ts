import { type SkillId, ensureSkillId as agnosticEnsureSkillId, ensureSkillIds as agnosticEnsureSkillIds, includeDirectPrerequisites as agnosticIncludeDirectPrerequisites, includeDirectPrerequisitesAndLinks as agnosticIncludeDirectPrerequisitesAndLinks, isSkillRequiredFor as agnosticIsSkillRequiredFor } from '@step-wise/skill-definition'

import { skillTree } from './processing'

export type { SkillId, SkillTree } from '@step-wise/skill-definition'

export function ensureSkillId(skillId: SkillId): SkillId {
	return agnosticEnsureSkillId(skillTree, skillId)
}

export function ensureSkillIds(skillIds: SkillId | readonly SkillId[]): SkillId[] {
	return agnosticEnsureSkillIds(skillTree, skillIds)
}

export function includeDirectPrerequisites(skillIds: SkillId | SkillId[]): SkillId[] {
	return agnosticIncludeDirectPrerequisites(skillTree, skillIds)
}

export function includeDirectPrerequisitesAndLinks(skillIds: SkillId | SkillId[]): SkillId[] {
	return agnosticIncludeDirectPrerequisitesAndLinks(skillTree, skillIds)
}

export function isSkillRequiredFor(childId: SkillId, parentId: SkillId): boolean {
	return agnosticIsSkillRequiredFor(skillTree, childId, parentId)
}
