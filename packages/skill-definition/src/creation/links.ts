import { isPlainObject, deduplicate } from '@step-wise/js-utils'

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

		// Determine the correlation, converting a legacy order when needed.
		if (link.order !== undefined && link.correlation !== undefined) throw new Error(`Invalid skill link: an order and a correlation cannot both be specified.`)
		const correlation = link.correlation ?? (link.order === undefined ? undefined : link.order / (link.order + 2))
		if (correlation !== undefined && (correlation <= 0 || correlation >= 1)) throw new Error(`Invalid skill correlation "${correlation}": expected a value between 0 and 1.`)

		return { skills, ...(correlation === undefined ? {} : { correlation }) }
	})
}

// For a skillTree list, set up the linkedSkills array within all skills.
export function applyLinks(skillTree: SkillTree): void {
	// Make sure that every link is also present at the linked skill.
	const originalLinks = Object.fromEntries(Object.entries(skillTree).map(([id, skill]) => [id, [...skill.links]])) as Record<SkillId, SkillLink[]>
	for (const [skillId, links] of Object.entries(originalLinks)) {
		const skill = skillTree[skillId]
		for (const link of links) {
			for (const linkedSkill of link.skills) {
				if (!skillTree[linkedSkill]) throw new Error(`Invalid skill link: received unknown skill ID "${linkedSkill}" in skill "${skill.id}".`)
				skillTree[linkedSkill].links.push({ ...link, skills: [...link.skills.filter(id => id !== linkedSkill), skill.id] })
			}
		}
	}

	// Run through all links and extract the corresponding skills.
	for (const skill of Object.values(skillTree)) skill.linkedSkills = deduplicate(skill.links.flatMap(link => link.skills))
}
