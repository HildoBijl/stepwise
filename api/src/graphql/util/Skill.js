const { Op } = require('sequelize')

const skills = require('step-wise/edu/skills')

// checkSkillIds checks an array of skillIds to see if they exist. Throws an error on an unknown skill.
function checkSkillIds(ids) {
	ids.forEach(id => {
		if (!skills[id])
			throw new Error(`Unknown skills "${id}" encountered.`)
	})
}

// getSkills uses a userId and an array of skillIds to get data from the database.
async function getSkills(userId, skillIds = [], db) {
	checkSkillIds(skillIds)
	if (skillIds.length === 0)
		return []
	return await db.UserSkill.findAll({ where: { userId, skillId: { [Op.or]: skillIds } } })
}

module.exports = {
	checkSkillIds,
	getSkills,
}
