const skills = require('step-wise/edu/skills')
const { getUserSkill, getUserSkills } = require('../util/Skill')

const commonResolvers = {
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
		skill: async (_source, { skillId }, { db, getUserId }) => {
			return await getUserSkill(getUserId(), skillId, db)
		},
		mySkills: async (_source, { skillIds }, { db, getUserId }) => {
			return await getUserSkills(getUserId(), skillIds, db)
		},
	},
}

module.exports = resolvers