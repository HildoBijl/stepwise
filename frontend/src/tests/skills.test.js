import skills from 'step-wise/edu/skills'

describe('Check all skills:', () => {
	Object.keys(skills).forEach(key => {
		const skill = skills[key]
		describe(key, () => {
			it('has an id matching its key', () => {
				expect(skills[key].id).toBe(key)
			})

			it('has a name', () => {
				expect(typeof skill.name).toBe('string')
			})

			// it('has at least one exercise', () => {
			// 	expect(Array.isArray(skill.exercises)).toBe(true)
			// 	expect(skill.exercises.length).toBeGreaterThan(0)
			// })

			it('has prerequisite links, which are mutual', () => {
				(skill.prerequisites || []).forEach(prerequisiteId => {
					const prerequisite = skills[prerequisiteId]
					expect(typeof prerequisite).toBe('object')
					expect(prerequisite.continuations || []).toContain(skill.id)
				})
			})

			it('has continuation links, which are mutual', () => {
				(skill.continuations || []).forEach(continuationId => {
					const continuation = skills[continuationId]
					expect(typeof continuation).toBe('object')
					expect(continuation.prerequisites || []).toContain(skill.id)
				})
			})
		})
	})
})

describe('The skill tree', () => {
	it('has no dependency cycles', () => {
		// Use a cycle detection algorithm for a directed graph. From each node, do a DFS to try and find a cycle. 
		const examined = {}
		const inRecursionTree = {}
		const examine = skill => {
			// Check if we found this already, and when.
			if (inRecursionTree[skill.id]) // In this current run? Then we have a cycle.
				throw new Error(`Skill cycle detected around skill "${skill.id}".`)
			if (examined[skill.id]) // In an earlier run? Then we can skip this.
				return
	
			// Note that we passed it. Then check all the children and see if we passed one already during this cycle.
			inRecursionTree[skill.id] = true
			examined[skill.id] = true
			skill.continuations.forEach(continuationId => examine(skills[continuationId]))
			inRecursionTree[skill.id] = false // If we get here, we didn't find a cycle. Mark the node as safe again.
		}
		Object.values(skills).forEach(skill => examine(skill))
	})
})