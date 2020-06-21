const skills = require('step-wise/edu/skills')
const { getUserSkill, getUserSkills } = require('../util/Skill')

const commonResolvers = {
	id: userSkill => userSkill.skillId,
	name: userSkill => skills[userSkill.skillId].name,
}

const resolvers = {
	Skill: {
		...commonResolvers,
		currentExercise: skill => skill.exercises.find(exercise => exercise.active),
	},

	SkillWithoutExercises: {
		...commonResolvers,
	},

	Query: {
		skill: async (_source, { id }, { db, getUserId }) => {
			return await getUserSkill(getUserId(), id, db)
		},
		mySkills: async (_source, { ids }, { db, getUserId }) => {
			return await getUserSkills(getUserId(), ids, db)
		},
	},
}

module.exports = resolvers