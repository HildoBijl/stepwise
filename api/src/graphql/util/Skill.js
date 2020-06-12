const skills = require('step-wise/edu/skills')
const { AuthenticationError, UserInputError  } = require('apollo-server-express')

// checkSkillIds checks an array of skillIds to see if they exist. It throws an error on an unknown skill. Otherwise it does nothing.
function checkSkillIds(ids) {
	ids.forEach(id => {
		if (!skills[id])
			throw new UserInputError(`Unknown skill "${id}" encountered.`)
	})
}

// getUserSkills takes a userId and skillIds and gets the UserSkills for the given user. The parameter skillIds can be ommitted (falsy) in which case all skills are extracted.
async function getUserSkills(userId, skillIds, db) {
	checkSkillIds(skillIds || [])

	// Load all data.
	const user = userId && await db.User.findOne({
		where: { id: userId },
		include: {
			model: db.UserSkill,
			where: skillIds ? { skillId: skillIds } : true,
			required: false,
		},
	})

	if (!user)
		throw new AuthenticationError(`No user is logged in.`)

	return user.userSkills
}

module.exports = {
	checkSkillIds,
	getUserSkills,
}
