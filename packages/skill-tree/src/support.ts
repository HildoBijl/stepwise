import { type SkillId, ensureSkillId as agnosticEnsureSkillId, ensureSkillIds as agnosticEnsureSkillIds, expandSkillIdsWithDirectPrerequisites as agnosticExpandSkillIdsWithDirectPrerequisites, expandSkillIdsWithDirectPrerequisitesAndLinks as agnosticExpandSkillIdsWithDirectPrerequisitesAndLinks, isSkillPrerequisiteOf as agnosticIsSkillPrerequisiteOf } from '@step-wise/skill-definition'

import { skillTree } from './processing'

export type { SkillId, SkillTree } from '@step-wise/skill-definition'

export function ensureSkillId(skillId: SkillId): SkillId {
	return agnosticEnsureSkillId(skillTree, skillId)
}

export function ensureSkillIds(skillIds: readonly SkillId[]): SkillId[] {
	return agnosticEnsureSkillIds(skillTree, skillIds)
}

export function expandSkillIdsWithDirectPrerequisites(skillIds: readonly SkillId[]): SkillId[] {
	return agnosticExpandSkillIdsWithDirectPrerequisites(skillTree, skillIds)
}

export function expandSkillIdsWithDirectPrerequisitesAndLinks(skillIds: readonly SkillId[]): SkillId[] {
	return agnosticExpandSkillIdsWithDirectPrerequisitesAndLinks(skillTree, skillIds)
}

export function isSkillPrerequisiteOf(prerequisiteId: SkillId, skillId: SkillId): boolean {
	return agnosticIsSkillPrerequisiteOf(skillTree, prerequisiteId, skillId)
}
