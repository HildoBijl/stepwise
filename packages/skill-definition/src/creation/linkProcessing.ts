import { deduplicate, ensureNumber, isPlainObject, sortBy } from '@step-wise/js-utils'

import type { RawSkillLink, SkillId, SkillLink, SkillTree } from './types.ts'

// Take a raw set of links and turn it into a processed SkillLink object.
export function normalizeSkillLinks(links?: RawSkillLink | RawSkillLink[]): SkillLink[] {
	// Ensure the links attribute is an array of links.
	if (Array.isArray(links) && links.length === 0) return []
	const list = links === undefined ? [] : Array.isArray(links) && !links.every(link => typeof link === 'string') ? links : [links]
	return list.map(link => {
		// Deal with strings or lists of strings.
		if (typeof link === 'string') {
			if (link.length === 0) throw new Error('Invalid skill link: linked skill IDs must not be empty.')
			return { skillIds: [link] }
		}
		if (Array.isArray(link) && link.every(elem => typeof elem === 'string')) {
			const skillIds = link as string[]
			if (skillIds.length === 0) throw new Error('Invalid skill link: expected at least one linked skill.')
			if (skillIds.some(skillId => skillId.length === 0)) throw new Error('Invalid skill link: linked skill IDs must not be empty.')
			return { skillIds }
		}
		if (!isPlainObject(link)) throw new Error(`Invalid skill link: expected a plain object, string or array, but got "${typeof link}".`)

		// For an object, extract the skill IDs.
		if (link.skillId !== undefined && link.skillIds !== undefined) throw new Error('Invalid skill link: "skillId" and "skillIds" cannot both be specified.')
		const skillIds = link.skillIds ?? (link.skillId === undefined ? undefined : Array.isArray(link.skillId) ? link.skillId : [link.skillId])
		if (!skillIds || !Array.isArray(skillIds) || skillIds.length === 0 || !skillIds.every(skillId => typeof skillId === 'string' && skillId.length > 0)) throw new Error(`Invalid skill link: linked skills were not properly given.`)

		// Validate the correlation when provided.
		const correlation = link.correlation === undefined ? undefined : ensureNumber(link.correlation)
		if (correlation !== undefined && (correlation <= 0 || correlation >= 1)) throw new RangeError(`Invalid skill correlation "${correlation}": expected a value between 0 and 1.`)

		return { skillIds, ...(correlation === undefined ? {} : { correlation }) }
	})
}

// For a skill tree, set up the links and linked skill IDs for every skill.
export function validateAndProcessLinks(skillTree: SkillTree): void {
	const skillIds = Object.keys(skillTree)
	const skillOrder = new Map(skillIds.map((skillId, index) => [skillId, index]))
	const relationships = new Map<string, { participants: SkillId[]; correlation?: number }>()
	const compareSkillIdLists = (list1: SkillId[], list2: SkillId[]): number => {
		for (let index = 0; index < Math.min(list1.length, list2.length); index++) {
			const difference = skillOrder.get(list1[index])! - skillOrder.get(list2[index])!
			if (difference !== 0) return difference
		}
		return list1.length - list2.length
	}

	// Validate and canonicalize every declared relationship.
	for (const skill of Object.values(skillTree)) {
		for (const link of skill.links) {
			for (const linkedSkillId of link.skillIds) {
				if (!skillTree[linkedSkillId]) throw new Error(`Invalid skill link: received unknown skill ID "${linkedSkillId}" in skill "${skill.id}".`)
				if (linkedSkillId === skill.id) throw new Error(`Invalid skill link: skill "${skill.id}" cannot link to itself.`)
			}
			if (new Set(link.skillIds).size !== link.skillIds.length) throw new Error(`Invalid skill link in skill "${skill.id}": linked skill IDs must not be repeated.`)

			const participants = sortBy([skill.id, ...link.skillIds], [skillOrder.get(skill.id)!, ...link.skillIds.map(skillId => skillOrder.get(skillId)!)])
			const relationshipKey = JSON.stringify(participants)
			const existingRelationship = relationships.get(relationshipKey)
			if (existingRelationship) {
				const participantList = participants.map(skillId => `"${skillId}"`).join(', ')
				if (existingRelationship.correlation !== link.correlation) throw new Error(`Conflicting skill link: the relationship between ${participantList} is declared with different correlations.`)
				throw new Error(`Duplicate skill link: the relationship between ${participantList} is declared more than once.`)
			}
			relationships.set(relationshipKey, { participants, ...(link.correlation === undefined ? {} : { correlation: link.correlation }) })
		}
	}

	// Rebuild all derived links from the canonical relationships.
	for (const skill of Object.values(skillTree)) {
		skill.links = []
		skill.linkedSkillIds = []
	}
	for (const relationship of relationships.values()) {
		for (const participant of relationship.participants) {
			skillTree[participant].links.push({ skillIds: relationship.participants.filter(skillId => skillId !== participant), ...(relationship.correlation === undefined ? {} : { correlation: relationship.correlation }) })
		}
	}
	for (const skill of Object.values(skillTree)) {
		skill.links.sort((link1, link2) => compareSkillIdLists(link1.skillIds, link2.skillIds))
		const linkedSkillIds = deduplicate(skill.links.flatMap(link => link.skillIds))
		skill.linkedSkillIds = sortBy(linkedSkillIds, linkedSkillIds.map(skillId => skillOrder.get(skillId)!))
	}
}
