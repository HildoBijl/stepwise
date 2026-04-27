import type { SkillId, SkillTree } from '../creation'

// Check whether a skill ID exists, in a case-insensitive way. Return the actual ID of the skill.
export function ensureSkillId(skillTree: SkillTree, skillId: SkillId): SkillId {
	// Check for direct matches.
	if (skillId in skillTree)	return skillId

	// Run a case-insensitive match.
	const skillIdLower = skillId.toLowerCase()
	const adjustedSkillId = Object.keys(skillTree).find(id => id.toLowerCase() === skillIdLower)
	if (adjustedSkillId) return adjustedSkillId as SkillId
	throw new Error(`Unknown skill ID: "${skillId}" is not known in the skill tree.`)
}

// Make sure the given parameters are existing skillIds.
export function ensureSkillIds(skillTree: SkillTree, skillIds: SkillId | readonly SkillId[]): SkillId[] {
	const list = Array.isArray(skillIds) ? [...skillIds] : [skillIds]
	return list.map(id => ensureSkillId(skillTree, id))
}
