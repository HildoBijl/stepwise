const skills = require('step-wise/edu/skills')
const { getUserSkill, getUserSkills } = require('../util/Skill')

const commonResolvers = {} // None at the moment.

const resolvers = {
	Skill: {
		...commonResolvers,
		currentExercise: skill => skill.exercises.find(exercise => exercise.active),
	},

	SkillWithoutExercises: {
		...commonResolvers,
	},

	Query: {
		skill: async (_source, { skillId }, { db, getUserIdOrThrow }) => {
			return await getUserSkill(getUserIdOrThrow(), skillId, db)
		},
		skills: async (_source, { skillIds }, { db, getUserIdOrThrow }) => {
			return await getUserSkills(getUserIdOrThrow(), skillIds, db)
		},
	},
}

module.exports = resolvers