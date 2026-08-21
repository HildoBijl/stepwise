import { type SkillSetup, type SkillSetupLike, ensureSetup } from '@step-wise/skill-setup'

import type { SkillId, SkillTree } from '../creation'

// Check whether a skill ID exists, in a case-insensitive way. Return the actual ID of the skill.
export function ensureSkillId(skillTree: SkillTree, skillId: SkillId): SkillId {
	// Check for direct matches.
	if (Object.hasOwn(skillTree, skillId)) return skillId

	// Run a case-insensitive match.
	const skillIdLower = skillId.toLowerCase()
	const adjustedSkillId = Object.keys(skillTree).find(id => id.toLowerCase() === skillIdLower)
	if (adjustedSkillId) return adjustedSkillId as SkillId
	throw new Error(`Unknown skill ID: "${skillId}" is not known in the skill tree.`)
}

// Make sure the given skill IDs exist.
export function ensureSkillIds(skillTree: SkillTree, skillIds: readonly SkillId[]): SkillId[] {
	return skillIds.map(skillId => ensureSkillId(skillTree, skillId))
}

// Make sure the set-up is valid for the Skill Tree.
export function ensureSkillSetup(skillTree: SkillTree, setup: SkillSetupLike): SkillSetup {
	const checkedSetup = ensureSetup(setup)
	ensureSkillIds(skillTree, checkedSetup.getSkillList())
	return checkedSetup
}
