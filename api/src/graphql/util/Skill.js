const skills = require('step-wise/edu/skills')
const { AuthenticationError, UserInputError  } = require('apollo-server-express')

// checkSkillIds checks an array of skillIds to see if they exist. It throws an error on an unknown skill. Otherwise it does nothing.
function checkSkillIds(ids) {
	ids.forEach(id => {
		if (!skills[id])
			throw new UserInputError(`Unknown skill "${id}" encountered.`)
	})
}

// getUserSkills takes a userId and skillIds and gets the UserSkills for the given user. The parameter skillIds can be ommitted (falsy) in which case all skills are extracted. No exercises are loaded.
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
					association: 'actions',
					required: false,
				},
			},
		},
	})

	if (!user)
		throw new AuthenticationError(`No user is logged in.`)

	return user.skills[0]
}

module.exports = {
	checkSkillIds,
	getUserSkills,
	getUserSkill,
}
