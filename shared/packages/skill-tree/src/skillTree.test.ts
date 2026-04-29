import type { Skill, SkillId } from '@step-wise/skill-definition'

import { skillTree } from './processing'

// Check individual skills.
describe('Check all skills:', () => {
	for (const [key, skill] of Object.entries(skillTree) as [SkillId, Skill][]) {
		describe(key, () => {
			it('has an id matching its key', () => {
				expect(skill.id).toBe(key)
			})

			it('has a name', () => {
				expect(typeof skill.name).toBe('string')
			})

			it('has prerequisite links, which are mutual', () => {
				expect(Array.isArray(skill.prerequisites)).toBe(true)
				for (const prerequisiteId of skill.prerequisites) {
					const prerequisite = skillTree[prerequisiteId]
					expect(prerequisite).toBeDefined()
					expect(prerequisite.continuations).toContain(skill.id)
				}
			})

			it('has continuation links, which are mutual', () => {
				expect(Array.isArray(skill.continuations)).toBe(true)
				for (const continuationId of skill.continuations) {
					const continuation = skillTree[continuationId]
					expect(continuation).toBeDefined()
					expect(continuation.prerequisites).toContain(skill.id)
				}
			})
			
			it('has no duplicate linked skills', () => {
				const linkedSkillsFiltered = [...new Set(skill.linkedSkills)]
				expect(linkedSkillsFiltered.length).toBe(skill.linkedSkills.length)
			})

			it('has no linked skills that are also prerequisites', () => {
				expect(skill.linkedSkills.find(linkedSkill => skill.prerequisites.find(prerequisite => prerequisite === linkedSkill))).toBe(undefined)
			})
		})
	}
})

// Check the hierarchy of skills.
describe('Check the skill tree:', () => {
	it('it has no dependency cycles', () => {
		const examined = new Set<SkillId>()
		const inRecursionTree = new Set<SkillId>()

		// Use a cycle detection algorithm for a directed graph. From each node, do a DFS to try and find a cycle. 
		const examine = (skill: Skill): void => {
			// If we found the node in the current run, there's a cycle. If we found it in an earlier run, don't examine again.
			if (inRecursionTree.has(skill.id)) throw new Error(`Skill cycle detected around skill "${skill.id}".`)
			if (examined.has(skill.id)) return
			inRecursionTree.add(skill.id)
			examined.add(skill.id)

			// Iterate over the children. If nothing is found, mark the node as safe again afterwards.
			for (const continuationId of skill.continuations) examine(skillTree[continuationId])
			inRecursionTree.delete(skill.id)
		}
		for (const skill of Object.values(skillTree) as Skill[]) examine(skill)
	})
})
