import { isPlainObject, filterDuplicates } from '@step-wise/utils'

import { defaultLinkOrder } from '../settings'

import type { RawSkillLink, SkillId, SkillLink, SkillTree } from './types'

// Take a raw set of links and turn it into a processed SkillLink object.
export function normalizeLinks(links?: RawSkillLink | RawSkillLink[]): SkillLink[] {
	// Ensure the links attribute is an array of links.
	const list = !links ? [] : Array.isArray(links) && !links.every(link => typeof link === 'string') ? links : [links]
	return list.map(link => {
		// Deal with strings or lists of strings.
		if (typeof link === 'string') return { skills: [link], order: defaultLinkOrder }
		if (Array.isArray(link) && link.every(elem => typeof elem === 'string')) return { skills: link as string[], order: defaultLinkOrder }
		if (!isPlainObject(link)) throw new Error(`Invalid skill link: expected a plain object, string or array, but got "${typeof link}".`)

		// For an object, extract the skill IDs.
		const skills = link.skills ?? (link.skill ? (Array.isArray(link.skill) ? link.skill : [link.skill]) : undefined)
		if (!skills || !Array.isArray(skills) || !skills.every(skillId => typeof skillId === 'string')) throw new Error(`Invalid skill link: linked skills were not properly given.`)

		// Determine the order, depending on the settings.
		const order = link.order ?? (() => {
			if (link.correlation === undefined) return defaultLinkOrder
			if (link.correlation <= 0 || link.correlation >= 1) throw new Error(`Invalid skill correlation "${link.correlation}": expected a value between 0 and 1.`)
			return Math.round(2 * link.correlation / (1 - link.correlation))
		})()

		return { skills, order }
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
	for (const skill of Object.values(skillTree)) skill.linkedSkills = filterDuplicates(skill.links.flatMap(link => link.skills))
}
