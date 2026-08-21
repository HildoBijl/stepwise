import { deduplicate, ensureNumber, isPlainObject, sortBy } from '@step-wise/js-utils'

import type { RawSkillLink, SkillId, SkillLink, SkillTree } from './types'

// Take a raw set of links and turn it into a processed SkillLink object.
export function normalizeLinks(links?: RawSkillLink | RawSkillLink[]): SkillLink[] {
	// Ensure the links attribute is an array of links.
	if (Array.isArray(links) && links.length === 0) return []
	const list = !links ? [] : Array.isArray(links) && !links.every(link => typeof link === 'string') ? links : [links]
	return list.map(link => {
		// Deal with strings or lists of strings.
		if (typeof link === 'string') return { skills: [link] }
		if (Array.isArray(link) && link.every(elem => typeof elem === 'string')) {
			if (link.length === 0) throw new Error('Invalid skill link: expected at least one linked skill.')
			return { skills: link as string[] }
		}
		if (!isPlainObject(link)) throw new Error(`Invalid skill link: expected a plain object, string or array, but got "${typeof link}".`)

		// For an object, extract the skill IDs.
		const skills = link.skills ?? (link.skill ? (Array.isArray(link.skill) ? link.skill : [link.skill]) : undefined)
		if (!skills || !Array.isArray(skills) || skills.length === 0 || !skills.every(skillId => typeof skillId === 'string')) throw new Error(`Invalid skill link: linked skills were not properly given.`)

		// Validate the correlation when provided.
		const correlation = link.correlation === undefined ? undefined : ensureNumber(link.correlation)
		if (correlation !== undefined && (correlation <= 0 || correlation >= 1)) throw new RangeError(`Invalid skill correlation "${correlation}": expected a value between 0 and 1.`)

		return { skills, ...(correlation === undefined ? {} : { correlation }) }
	})
}

// For a skillTree list, set up the linkedSkills array within all skills.
export function applyLinks(skillTree: SkillTree): void {
	const skillIds = Object.keys(skillTree)
	const skillOrder = new Map(skillIds.map((skillId, index) => [skillId, index]))
	const relationships = new Map<string, { participants: SkillId[]; correlation?: number }>()

	// Validate and canonicalize every declared relationship.
	for (const skill of Object.values(skillTree)) {
		for (const link of skill.links) {
			for (const linkedSkillId of link.skills) {
				if (!skillTree[linkedSkillId]) throw new Error(`Invalid skill link: received unknown skill ID "${linkedSkillId}" in skill "${skill.id}".`)
				if (linkedSkillId === skill.id) throw new Error(`Invalid skill link: skill "${skill.id}" cannot link to itself.`)
			}
			if (new Set(link.skills).size !== link.skills.length) throw new Error(`Invalid skill link in skill "${skill.id}": linked skill IDs must not be repeated.`)

			const participants = sortBy([skill.id, ...link.skills], [skillOrder.get(skill.id)!, ...link.skills.map(skillId => skillOrder.get(skillId)!)])
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
		skill.linkedSkills = []
	}
	for (const relationship of relationships.values()) {
		for (const participant of relationship.participants) {
			skillTree[participant].links.push({ skills: relationship.participants.filter(skillId => skillId !== participant), ...(relationship.correlation === undefined ? {} : { correlation: relationship.correlation }) })
		}
	}
	for (const skill of Object.values(skillTree)) skill.linkedSkills = deduplicate(skill.links.flatMap(link => link.skills))
}
