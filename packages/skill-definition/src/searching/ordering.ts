import { sortBy } from '@step-wise/js-utils'

import type { SkillId, SkillTree } from '../creation'

import { ensureSkillIds } from './validation'

// Sort a given list of skill IDs by the order defined by the Skill Tree.
export function sortSkillIdsByTreeOrder(skillTree: SkillTree, skillIds: readonly SkillId[]): SkillId[] {
	const ensuredSkillIds = ensureSkillIds(skillTree, skillIds)
	const skillOrder = new Map(Object.keys(skillTree).map((skillId, index) => [skillId, index]))
	return sortBy(ensuredSkillIds, ensuredSkillIds.map(skillId => skillOrder.get(skillId)!))
}
