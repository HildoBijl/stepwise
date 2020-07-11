import skills from 'step-wise/edu/skills'

it('every skill has an id matching its key', () => {
	Object.keys(skills).forEach(key => {
		expect(skills[key].id).toBe(key)
	})
})

it('every skill has a name', () => {
	Object.values(skills).forEach(skill => {
		expect(typeof skill.name).toBe('string')
	})
})

it('every skill has at least one exercise', () => {
	Object.values(skills).forEach(skill => {
		expect(Array.isArray(skill.exercises)).toBe(true)
		expect(skill.exercises.length).toBeGreaterThan(0)
	})
})

it('prerequisite links exist and are mutual', () => {
	Object.values(skills).forEach(skill => {
		(skill.prerequisites || []).forEach(prerequisiteId => {
			const prerequisite = skills[prerequisiteId]
			expect(typeof prerequisite).toBe('object')
			expect(prerequisite.continuations || []).toContain(skill.id)
		})
	})
})

it('continuation links exist and are mutual', () => {
	Object.values(skills).forEach(skill => {
		(skill.continuations || []).forEach(continuationId => {
			const continuation = skills[continuationId]
			expect(typeof continuation).toBe('object')
			expect(continuation.prerequisites || []).toContain(skill.id)
		})
	})
})

it('there are no dependency cycles in the skill tree', () => {
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

// ToDo for later: check that skills all have theory blocks too.