import { type SkillId, ensureSkillId as agnosticEnsureSkillId, ensureSkillIds as agnosticEnsureSkillIds, getSkillIdsWithDirectPrerequisites as agnosticGetSkillIdsWithDirectPrerequisites, getSkillIdsWithDirectPrerequisitesAndLinks as agnosticGetSkillIdsWithDirectPrerequisitesAndLinks, isSkillPrerequisiteFor as agnosticIsSkillPrerequisiteFor } from '@step-wise/skill-definition'

import { skillTree } from './processing'

export type { SkillId, SkillTree } from '@step-wise/skill-definition'

export function ensureSkillId(skillId: SkillId): SkillId {
	return agnosticEnsureSkillId(skillTree, skillId)
}

export function ensureSkillIds(skillIds: readonly SkillId[]): SkillId[] {
	return agnosticEnsureSkillIds(skillTree, skillIds)
}

export function getSkillIdsWithDirectPrerequisites(skillIds: readonly SkillId[]): SkillId[] {
	return agnosticGetSkillIdsWithDirectPrerequisites(skillTree, skillIds)
}

export function getSkillIdsWithDirectPrerequisitesAndLinks(skillIds: readonly SkillId[]): SkillId[] {
	return agnosticGetSkillIdsWithDirectPrerequisitesAndLinks(skillTree, skillIds)
}

export function isSkillPrerequisiteFor(prerequisiteId: SkillId, skillId: SkillId): boolean {
	return agnosticIsSkillPrerequisiteFor(skillTree, prerequisiteId, skillId)
}
