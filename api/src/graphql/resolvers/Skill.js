const skills = require('step-wise/edu/skills')
const { getUserSkills } = require('../util/Skill')

const commonResolvers = {
	id: userSkill => userSkill.skillId,
	name: userSkill => skills[userSkill.skillId].name,
}

const resolvers = {
	Skill: {
		...commonResolvers,
		exercises: async (userSkill, _args, { db }) => await db.ExerciseSample.findAll({ where: { userSkillId: userSkill.id } }),
		currentExercise: async (userSkill, _args, { db }) => await db.ExerciseSample.findOne({ where: { userSkillId: userSkill.id, active: true, } })
	},

	SkillWithoutExercises: {
		...commonResolvers,
	},

	Query: {
		skill: async (_source, { id }, { db, getUserId }) => {
			return (await getUserSkills(getUserId(), [id], db))[0]
			// ToDo later: set up data loader to make the querying behind this more efficient. Now all exercises are obtained one by one, and the same for submissions.
		},
		mySkills: async (_source, { ids }, { db, getUserId }) => {
			return await getUserSkills(getUserId(), ids, db)
		},
	},
}

module.exports = resolvers
