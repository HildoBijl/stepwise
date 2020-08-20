const skills = {
	fillInInteger: {
		name: 'Geheel getal invullen',
		prerequisites: [],
		exercises: ['fillInInteger'],
	},
	fillInFloat: {
		name: 'Kommagetal invullen',
		prerequisites: ['fillInInteger'],
		exercises: ['fillInFloat'],
	},
	fillInUnit: {
		name: 'Eenheid invullen',
		prerequisites: [],
		exercises: ['fillInUnit'],
	},
	lookUpConstant: {
		name: 'Constanten opzoeken',
		prerequisites: ['fillInFloat', 'fillInUnit'],
		exercises: ['lookUpConstant'],
	},
	summation: {
		name: 'Optellen',
		prerequisites: ['fillInInteger'],
		exercises: ['summation1'],
	},
	multiplication: {
		name: 'Vermenigvuldigen',
		prerequisites: ['fillInInteger'],
		exercises: ['multiplication1'],
	},
	summationAndMultiplication: {
		name: 'Optellen en vermenigvuldigen',
		prerequisites: ['summation', 'multiplication'],
		exercises: ['summationAndMultiplication1', 'summationAndMultiplication2'],
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
