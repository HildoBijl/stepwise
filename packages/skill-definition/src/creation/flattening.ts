import { SkillSetup } from '@step-wise/skill-setup'
import { deduplicate, ensureNumber, isPlainObject } from '@step-wise/js-utils'

import { normalizeRawSkillLinks } from './linkProcessing'
import type { SkillId, RawSkillDefinition, RawSkillTree, SkillTree } from './types'

// Check if something is a container or a raw skill.
function isRawSkillDefinition(value: unknown): value is RawSkillDefinition {
	return isPlainObject(value) && typeof value.name === 'string'
}

function ensureValidSkillId(skillId: unknown, description: string): SkillId {
	if (typeof skillId !== 'string') throw new TypeError(`Invalid ${description}: expected a string, but received type "${typeof skillId}".`)
	if (skillId.length === 0) throw new RangeError(`Invalid ${description}: skill IDs must not be empty.`)
	if (skillId.trim() !== skillId) throw new RangeError(`Invalid ${description} "${skillId}": skill IDs must not start or end with whitespace.`)
	return skillId
}

function validateRawSkillDefinition(value: RawSkillDefinition, skillId: SkillId, skillPath: string): void {
	if (value.name.trim().length === 0) throw new RangeError(`Invalid skill name for "${skillId}" at "${skillPath}": skill names must not be empty or consist only of whitespace.`)

	if (value.prerequisites !== undefined) {
		if (!Array.isArray(value.prerequisites)) throw new TypeError(`Invalid prerequisites for skill "${skillId}": expected an array of skill IDs.`)
		value.prerequisites.forEach(prerequisiteId => ensureValidSkillId(prerequisiteId, `prerequisite skill ID for skill "${skillId}"`))
	}

	if (value.setup !== undefined) {
		if (!(value.setup instanceof SkillSetup)) throw new TypeError(`Invalid setup for skill "${skillId}": expected a SkillSetup instance.`)
		value.setup.getSkillList().forEach(setupSkillId => ensureValidSkillId(setupSkillId, `setup skill ID for skill "${skillId}"`))
	}

	if (value.thresholds !== undefined) {
		if (!isPlainObject(value.thresholds)) throw new TypeError(`Invalid thresholds for skill "${skillId}": expected a plain object.`)
		if (value.thresholds.pass !== undefined) {
			const pass = ensureNumber(value.thresholds.pass)
			if (pass < 0 || pass > 1) throw new RangeError(`Invalid pass threshold "${pass}" for skill "${skillId}": expected a value between 0 and 1.`)
		}
	}
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
				const skillId = ensureValidSkillId(key, `skill ID at "${skillPath}"`)
				validateRawSkillDefinition(value, skillId, skillPath)
				const normalizedSkillId = skillId.toLowerCase()
				const existingSkill = registeredSkillIds.get(normalizedSkillId)
				if (existingSkill) throw new Error(`Duplicate skill ID: "${skillId}" at "${skillPath}" conflicts with "${existingSkill.id}" at "${existingSkill.path}". Skill IDs must be unique regardless of casing.`)
				registeredSkillIds.set(normalizedSkillId, { id: skillId, path: skillPath })

				groupSkillIds.push(skillId)

				skillTree[skillId] = {
					id: skillId,
					name: value.name,
					path,
					groupSkillIds,
					setup: value.setup,
					prerequisiteIds: deduplicate([...(value.prerequisites ?? []), ...(value.setup?.getSkillList() ?? [])]),
					continuationIds: [],
					links: normalizeRawSkillLinks(value.links).map(link => {
						link.skillIds.forEach(linkedSkillId => ensureValidSkillId(linkedSkillId, `linked skill ID for skill "${skillId}"`))
						return link
					}),
					linkedSkillIds: [],
					thresholds: value.thresholds,
				}
			} else walk(value, [...path, key])
		}
	}

	walk(rawSkillTree)
	return skillTree
}
