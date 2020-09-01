const { getCombinerSkills } = require('../skillTracking/combiners')

const skills = {
	fillInInteger: {
		name: 'Geheel getal invullen',
		exercises: ['fillInInteger'],
	},
	fillInFloat: {
		name: 'Kommagetal invullen',
		exercises: ['fillInFloat'],
	},
	fillInUnit: {
		name: 'Eenheid invullen',
		exercises: ['fillInUnit'],
	},
	lookUpConstant: {
		name: 'Constanten opzoeken',
		exercises: ['lookUpConstant'],
	},
	summation: {
		name: 'Optellen',
		exercises: ['summation1'],
	},
	multiplication: {
		name: 'Vermenigvuldigen',
		exercises: ['multiplication1'],
	},
	summationAndMultiplication: {
		name: 'Optellen en vermenigvuldigen',
		setup: { type: 'and', skills: [{ type: 'repeat', times: 2, skill: 'multiplication' }, 'summation'] },
		exercises: ['summationAndMultiplication1', 'summationAndMultiplication2'],
	},
}

// Process the skill object.
Object.keys(skills).forEach(key => {
	const skill = skills[key]
	skill.id = key // Inform the skills of their own id.
	skill.prerequisites = skill.setup ? getCombinerSkills(skill.setup) : [] // If no set-up is given, there are none.
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
