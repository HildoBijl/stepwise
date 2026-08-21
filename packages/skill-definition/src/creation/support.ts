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
	const registeredSkillIds = new Map<string, { id: SkillId; path: string }>()

	const walk = (group: unknown, path: string[] = []) => {
		if (!isPlainObject(group)) throw new TypeError(`Invalid raw skill tree entry at "${path.join('/') || '<root>'}": expected a skill or group object.`)
		const skillsInGroup: SkillId[] = []
		for (const [key, value] of Object.entries(group)) {
			if (isRawSkill(value)) {
				const skillPath = [...path, key].join('/')
				if (key.length === 0) throw new RangeError(`Invalid skill ID at "${skillPath}": skill IDs must not be empty.`)
				if (value.name.length === 0) throw new RangeError(`Invalid skill name for "${key}" at "${skillPath}": skill names must not be empty.`)
				const normalizedSkillId = key.toLowerCase()
				const existingSkill = registeredSkillIds.get(normalizedSkillId)
				if (existingSkill) throw new Error(`Duplicate skill ID: "${key}" at "${skillPath}" conflicts with "${existingSkill.id}" at "${existingSkill.path}". Skill IDs must be unique regardless of casing.`)
				registeredSkillIds.set(normalizedSkillId, { id: key, path: skillPath })

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
	// Validate all prerequisite references before modifying the tree.
	for (const skill of Object.values(skillTree)) {
		for (const prerequisiteId of skill.prerequisites) {
			if (!skillTree[prerequisiteId]) throw new Error(`Invalid prerequisite skill "${prerequisiteId}" given for skill "${skill.id}".`)
		}
	}

	// Reject cyclic prerequisite graphs.
	const states = new Map<SkillId, 'visiting' | 'visited'>()
	const path: SkillId[] = []
	const visit = (skillId: SkillId): void => {
		const state = states.get(skillId)
		if (state === 'visited') return
		if (state === 'visiting') {
			const cycleStart = path.indexOf(skillId)
			const cycle = [...path.slice(cycleStart), skillId]
			throw new Error(`Invalid skill prerequisites: detected cycle ${cycle.map(id => `"${id}"`).join(' -> ')}.`)
		}
		states.set(skillId, 'visiting')
		path.push(skillId)
		for (const prerequisiteId of skillTree[skillId].prerequisites) visit(prerequisiteId)
		path.pop()
		states.set(skillId, 'visited')
	}
	for (const skillId of Object.keys(skillTree)) visit(skillId)

	// Set up the reverse prerequisite references.
	for (const skill of Object.values(skillTree)) {
		for (const prerequisiteId of skill.prerequisites) {
			skillTree[prerequisiteId].continuations.push(skill.id)
		}
	}
}
