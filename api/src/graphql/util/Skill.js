const skills = require('step-wise/edu/skills')
const { AuthenticationError, UserInputError  } = require('apollo-server-express')

// checkSkillIds checks an array of skillIds to see if they exist. It throws an error on an unknown skill. Otherwise it does nothing.
function checkSkillIds(skillIds) {
	skillIds.forEach(skillId => {
		if (!skills[skillId])
			throw new UserInputError(`Unknown skill "${skillId}" encountered.`)
	})
}

// getUserSkill takes a userId and a skillId and gets the corresponding skill object, including all exercises and actions.
async function getUserSkill(userId, skillId, db) {
	checkSkillIds([skillId])
	
	// Load all data.
	const user = userId && await db.User.findByPk(userId, {
		include: {
			association: 'skills',
			where: { skillId },
			required: false,
			include: {
				association: 'exercises',
				required: false,
				include: {
					association: 'events',
					required: false,
				},
			},
		},
	})

	if (!user)
		throw new AuthenticationError(`No user is logged in.`)

	return user.skills[0]
}

// getUserSkills takes a userId and skillIds and gets the UserSkills for the given user. The parameter skillIds can be ommitted (falsy) in which case all skills are extracted. This is usually not recommended though. No exercises are loaded.
async function getUserSkills(userId, skillIds, db) {
	checkSkillIds(skillIds || [])

	// Load all data.
	const user = userId && await db.User.findByPk(userId, {
		include: {
			association: 'skills',
			where: skillIds ? { skillId: skillIds } : true,
			required: false,
		},
	})

	if (!user)
		throw new AuthenticationError(`No user is logged in.`)

	return user.skills
}

module.exports = {
	checkSkillIds,
	getUserSkills,
	getUserSkill,
}
