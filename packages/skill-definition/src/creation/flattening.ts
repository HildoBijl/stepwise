import { SkillSetup } from '@step-wise/skill-setup'
import { deduplicate, isPlainObject } from '@step-wise/js-utils'

import { normalizeSkillLinks } from './linkProcessing.ts'
import { resolveSkillThresholdOptions } from './thresholdOptions.ts'
import type { SkillId, SkillDefinition, SkillTreeDefinition, SkillTree } from './types.ts'

// Check if something is a container or a skill definition.
function isSkillDefinition(value: unknown): value is SkillDefinition {
	return isPlainObject(value) && typeof value.name === 'string'
}

function ensureValidSkillId(skillId: unknown, description: string): SkillId {
	if (typeof skillId !== 'string') throw new TypeError(`Invalid ${description}: expected a string, but received type "${typeof skillId}".`)
	if (skillId.length === 0) throw new RangeError(`Invalid ${description}: skill IDs must not be empty.`)
	if (skillId.trim() !== skillId) throw new RangeError(`Invalid ${description} "${skillId}": skill IDs must not start or end with whitespace.`)
	return skillId
}

function validateSkillDefinition(value: SkillDefinition, skillId: SkillId, skillPath: string): void {
	if (value.name.trim().length === 0) throw new RangeError(`Invalid skill name for "${skillId}" at "${skillPath}": skill names must not be empty or consist only of whitespace.`)

	if (value.prerequisites !== undefined) {
		if (!Array.isArray(value.prerequisites)) throw new TypeError(`Invalid prerequisites for skill "${skillId}": expected an array of skill IDs.`)
		value.prerequisites.forEach(prerequisiteId => ensureValidSkillId(prerequisiteId, `prerequisite skill ID for skill "${skillId}"`))
	}

	if (value.setup !== undefined) {
		if (!(value.setup instanceof SkillSetup)) throw new TypeError(`Invalid setup for skill "${skillId}": expected a SkillSetup instance.`)
		value.setup.getSkillList().forEach(setupSkillId => ensureValidSkillId(setupSkillId, `setup skill ID for skill "${skillId}"`))
	}
}

// Take a definition of a skill tree and turn it into useful lists.
export function flattenSkillTreeDefinition(skillTreeDefinition: SkillTreeDefinition): SkillTree {
	const skillTree = Object.create(null) as SkillTree
	const registeredSkillIds = new Map<string, { id: SkillId; path: string }>()

	const walk = (group: unknown, path: string[] = []) => {
		if (!isPlainObject(group)) throw new TypeError(`Invalid raw skill tree entry at "${path.join('/') || '<root>'}": expected a skill or group object.`)
		const groupModuleIds: SkillId[] = []
		for (const [key, value] of Object.entries(group)) {
			if (isSkillDefinition(value)) {
				const skillPath = [...path, key].join('/')
				const skillId = ensureValidSkillId(key, `skill ID at "${skillPath}"`)
				validateSkillDefinition(value, skillId, skillPath)
				const normalizedSkillId = skillId.toLowerCase()
				const existingSkill = registeredSkillIds.get(normalizedSkillId)
				if (existingSkill) throw new Error(`Duplicate skill ID: "${skillId}" at "${skillPath}" conflicts with "${existingSkill.id}" at "${existingSkill.path}". Skill IDs must be unique regardless of casing.`)
				registeredSkillIds.set(normalizedSkillId, { id: skillId, path: skillPath })

				groupModuleIds.push(skillId)

				skillTree[skillId] = {
					id: skillId,
					type: 'skill',
					name: value.name,
					groupPath: path,
					groupModuleIds,
					setup: value.setup,
					prerequisiteIds: deduplicate([...(value.prerequisites ?? []), ...(value.setup?.getSkillList() ?? [])]),
					continuationIds: [],
					links: normalizeSkillLinks(value.links).map(link => {
						link.skillIds.forEach(linkedSkillId => ensureValidSkillId(linkedSkillId, `linked skill ID for skill "${skillId}"`))
						return link
					}),
					linkedSkillIds: [],
					thresholds: resolveSkillThresholdOptions(value.thresholds),
				}
			} else walk(value, [...path, key])
		}
	}

	walk(skillTreeDefinition)
	return skillTree
}
