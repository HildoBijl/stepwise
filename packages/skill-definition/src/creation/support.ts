import { deduplicate, isPlainObject } from '@step-wise/js-utils'

import { normalizeLinks } from './links'
import type { SkillId, RawSkill, RawSkillGroup, SkillTree } from './types'

// Check if something is a container or a raw skill.
function isRawSkill(value: unknown): value is RawSkill {
	return isPlainObject(value) && typeof value.name === 'string'
}

// Take a definition of a skill tree and turn it into useful lists.
export function flattenSkillTree(rawSkillTree: RawSkillGroup): SkillTree {
	const skillTree = Object.create(null) as SkillTree
	const skillsPerGroup = new Map<string, SkillId[]>()
	const registeredSkillIds = new Map<string, { id: SkillId; path: string }>()

	const walk = (group: unknown, path: string[] = []) => {
		if (!isPlainObject(group)) throw new TypeError(`Invalid raw skill tree entry at "${path.join('/') || '<root>'}": expected a skill or group object.`)
		for (const [key, value] of Object.entries(group)) {
			if (isRawSkill(value)) {
				const skillPath = [...path, key].join('/')
				const normalizedSkillId = key.toLowerCase()
				const existingSkill = registeredSkillIds.get(normalizedSkillId)
				if (existingSkill) throw new Error(`Duplicate skill ID: "${key}" at "${skillPath}" conflicts with "${existingSkill.id}" at "${existingSkill.path}". Skill IDs must be unique regardless of casing.`)
				registeredSkillIds.set(normalizedSkillId, { id: key, path: skillPath })

				const groupKey = path.join('/')
				let skillsInGroup = skillsPerGroup.get(groupKey)
				if (!skillsInGroup) {
					skillsInGroup = []
					skillsPerGroup.set(groupKey, skillsInGroup)
				}
				skillsInGroup.push(key)

				skillTree[key] = {
					id: key,
					name: value.name,
					path,
					skillsInGroup,
					setup: value.setup,
					prerequisites: deduplicate([...(value.prerequisites ?? []), ...(value.setup?.getSkillList() ?? [])]),
					continuations: [],
					links: normalizeLinks(value.links),
					linkedSkills: [],
					thresholds: value.thresholds,
				}
			} else walk(value, [...path, key])
		}
	}

	walk(rawSkillTree)
	return skillTree
}

// For a given semi-processed skillTree, set up the continuations attributes for each skill.
export function applyContinuations(skillTree: SkillTree): void {
	for (const skill of Object.values(skillTree)) {
		for (const prerequisiteId of skill.prerequisites) {
			const prerequisite = skillTree[prerequisiteId]
			if (!prerequisite) throw new Error(`Invalid prerequisite skill "${prerequisiteId}" given for skill "${skill.id}".`)
			prerequisite.continuations.push(skill.id)
		}
	}
}
