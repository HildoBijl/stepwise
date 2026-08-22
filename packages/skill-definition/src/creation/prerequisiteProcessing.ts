import type { SkillId, SkillTree } from './types'

// Validate prerequisites and set up the continuation IDs for each skill.
export function validateAndProcessPrerequisites(skillTree: SkillTree): void {
	// Validate all prerequisite references before modifying the tree.
	for (const skill of Object.values(skillTree)) {
		for (const prerequisiteId of skill.prerequisiteIds) {
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
		for (const prerequisiteId of skillTree[skillId].prerequisiteIds) visit(prerequisiteId)
		path.pop()
		states.set(skillId, 'visited')
	}
	for (const skillId of Object.keys(skillTree)) visit(skillId)

	// Set up the reverse prerequisite references.
	for (const skill of Object.values(skillTree)) {
		for (const prerequisiteId of skill.prerequisiteIds) skillTree[prerequisiteId].continuationIds.push(skill.id)
	}
}
