const skills = {
	fillInInteger: {
		name: 'Fill in an integer',
		prerequisites: [],
		exercises: ['fillInInteger'],
	},
	example: {
		name: 'Example skill',
		prerequisites: ['fillInInteger'],
		exercises: ['exampleExercise1'],
	},
	summation: {
		name: 'Summation',
		prerequisites: ['fillInInteger'],
		exercises: ['summation1'],
	},
	multiplication: {
		name: 'Multiplication',
		prerequisites: ['fillInInteger'],
		exercises: ['multiplication1'],
	},
	summationOfMultiplications: {
		name: 'Summation of multiplications',
		prerequisites: ['summation','multiplication'],
		exercises: ['summationOfMultiplications1','summationOfMultiplications2'],
	},
}

// Process the skill object.
Object.keys(skills).forEach(key => {
	const skill = skills[key]
	skill.id = key // Inform the skills of their own id.
	skill.prerequisites = skill.prerequisites || [] // If not given, there are none.
	skill.continuations = [] // Prepare an empty array.
})

// Set up continuations.
Object.values(skills).forEach(skill => {
	skill.prerequisites.forEach(prerequisiteId => {
		const prerequisite = skills[prerequisiteId]
		if (!prerequisite)
			throw new Error(`Invalid prerequisite skill "${prerequisiteId}" given for skill "${skill.id}".`)
		prerequisite.continuations.push(skill.id)
	})
})

module.exports = skills
