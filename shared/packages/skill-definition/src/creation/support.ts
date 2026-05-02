import { filterDuplicates } from '@step-wise/utils'

import { normalizeLinks } from './links'
import type { SkillId, RawSkill, RawSkillGroup, SkillTree } from './types'

// Check if something is a container or a raw skill.
function isRawSkill(value: RawSkill | RawSkillGroup): value is RawSkill {
	return 'name' in value
}

// Take a definition of a skill tree and turn it into useful lists.
export function flattenSkillTree(rawSkillTree: RawSkillGroup): SkillTree {
	const skillTree: SkillTree = {}
	const skillsPerGroup: Record<string, SkillId[]> = {}

	const walk = (group: RawSkillGroup, path: string[] = []) => {
		for (const [key, value] of Object.entries(group)) {
			if (isRawSkill(value)) {
				const groupKey = path.join('/')
				const skillsInGroup = skillsPerGroup[groupKey] ?? (skillsPerGroup[groupKey] = [])
				skillsInGroup.push(key)

				skillTree[key] = {
					id: key,
					name: value.name,
					path,
					skillsInGroup,
					setup: value.setup,
					prerequisites: filterDuplicates([...(value.prerequisites ?? []), ...(value.setup?.getSkillList() ?? [])]),
					continuations: [],
					links: normalizeLinks(value.links),
					linkedSkills: [],
					examples: value.examples ? (Array.isArray(value.examples) ? value.examples : [value.examples]) : [],
					exercises: value.exercises ? (Array.isArray(value.exercises) ? value.exercises : [value.exercises]) : [],
					thresholds: value.thresholds,
				}
			} else {
				walk(value, [...path, key])
			}
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

// Exercise legacy: Adjust exercise/example IDs to also include skill IDs.
export function processExercises(skillTree: SkillTree): void {
	for (const skill of Object.values(skillTree)) {
		skill.examples = skill.examples.map(exerciseName => `${skill.id}.${exerciseName}`)
		skill.exercises = skill.exercises.map(exerciseName => `${skill.id}.${exerciseName}`)
	}
}
