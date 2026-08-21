import { deduplicate, isPlainObject } from '@step-wise/js-utils'

import { normalizeRawSkillLinks } from './linkProcessing'
import type { SkillId, RawSkillDefinition, RawSkillTree, SkillTree } from './types'

// Check if something is a container or a raw skill.
function isRawSkillDefinition(value: unknown): value is RawSkillDefinition {
	return isPlainObject(value) && typeof value.name === 'string'
}

// Take a definition of a skill tree and turn it into useful lists.
export function flattenRawSkillTree(rawSkillTree: RawSkillTree): SkillTree {
	const skillTree = Object.create(null) as SkillTree
	const registeredSkillIds = new Map<string, { id: SkillId; path: string }>()

	const walk = (group: unknown, path: string[] = []) => {
		if (!isPlainObject(group)) throw new TypeError(`Invalid raw skill tree entry at "${path.join('/') || '<root>'}": expected a skill or group object.`)
		const groupSkillIds: SkillId[] = []
		for (const [key, value] of Object.entries(group)) {
			if (isRawSkillDefinition(value)) {
				const skillPath = [...path, key].join('/')
				if (key.length === 0) throw new RangeError(`Invalid skill ID at "${skillPath}": skill IDs must not be empty.`)
				if (value.name.length === 0) throw new RangeError(`Invalid skill name for "${key}" at "${skillPath}": skill names must not be empty.`)
				const normalizedSkillId = key.toLowerCase()
				const existingSkill = registeredSkillIds.get(normalizedSkillId)
				if (existingSkill) throw new Error(`Duplicate skill ID: "${key}" at "${skillPath}" conflicts with "${existingSkill.id}" at "${existingSkill.path}". Skill IDs must be unique regardless of casing.`)
				registeredSkillIds.set(normalizedSkillId, { id: key, path: skillPath })

				groupSkillIds.push(key)

				skillTree[key] = {
					id: key,
					name: value.name,
					path,
					groupSkillIds,
					setup: value.setup,
					prerequisiteIds: deduplicate([...(value.prerequisites ?? []), ...(value.setup?.getSkillList() ?? [])]),
					continuationIds: [],
					links: normalizeRawSkillLinks(value.links),
					linkedSkillIds: [],
					thresholds: value.thresholds,
				}
			} else walk(value, [...path, key])
		}
	}

	walk(rawSkillTree)
	return skillTree
}
