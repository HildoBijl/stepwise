const { gql } = require('apollo-server-express')
const { EmailAddressResolver, DateTimeResolver, JSONObjectResolver } = require('graphql-scalars')
const skills = require('step-wise/edu/skills')
const { Op } = require('sequelize')

// ToDo: check if a JSON field from the database can be sent as a string through GraphQL.
const typeDefs = gql`
	scalar EmailAddress
	scalar DateTime
	scalar JSON
	enum ExerciseStatus { inProgress solved split givenUp }

	type User {
		name: String!
		email: EmailAddress!
		skills(ids: [String]): [Skill]!
	}

	type Skill {
		id: String!
		name: String!
		coefficients: [Float]!
		coefficientsOn: DateTime!
		highest: [Float]!
		highestOn: DateTime!
		exercises: [Exercise]!
	}

	type Exercise {
		id: String!
		state: JSON!
		status: ExerciseStatus!
		startedOn: DateTime!
		submissions: [Submission]!
	}

	type Submission {
		input: JSON!
		correct: JSON!
	}

	type Query {
		me: User
		mySkills(ids: [String]): [Skill]
	}

	type Mutation {
		startExercise(skillId: String!): Exercise!
		# submitExercise(skillId: String!, input: JSON!): [Skill]!
		# splitUpExercise(skillId: String!): [Skill]!
		# giveUpExercise(skillId: String!): [Skill]!
	}
`

const resolvers = {
	EmailAddress: EmailAddressResolver,
	DateTime: DateTimeResolver,
	JSON: JSONObjectResolver,

	Query: {
		me: async (_source, _args, { dataSources, getPrincipal }) => {
			const user = getPrincipal()
			if (!user)
				return null
			return await dataSources.database.User.findByPk(user.id)
		},
		mySkills: async (_source, { ids }, { dataSources, getPrincipal }) => {
			const user = getPrincipal()
			if (!user)
				return null
			if (!ids)
				return await dataSources.database.UserSkill.findAll({ where: { userId: user.id } })
			return await dataSources.database.UserSkill.findAll({ where: { userId: user.id, skillId: { [Op.or]: ids } } })
		},
	},
	Mutation: {
		startExercise: async (_source, { skillId }, { dataSources, getPrincipal }) => {
			// Check if there is a user.
			const user = getPrincipal()
			if (!user)
				throw new Error(`Cannot start a new exercise: no user is logged in.`)

			// Check if the given skill exists.
			const skill = skills[skillId]
			if (!skill)
				throw new Error(`Cannot start a new exercise: the given skill "${skillId}" does not exist.`)

			// Check if the last exercise is done. [ToDo: check if this can be done in one query, using a composite primary key or a join.]
			const userSkill = await dataSources.database.UserSkill.findOne({ where: { userId: user.id, skillId } })
			const lastExercise = await dataSources.database.ExerciseSample.findOne({ where: { userSkillId: userSkill.id }, order: [['createdAt', 'DESC']] })
			if (lastExercise && !isExerciseDone(lastExercise))
				throw new Error(`Cannot start a new exercise: the previous one is not done yet.`)

			// ToDo: select the correct exercise for this user.
			const exerciseId = skill.exercises[0] // Temporary: just pick the first.

			// Start the new exercise.
			const { generateState } = require(`step-wise/edu/exercises/${exerciseId}`)
			const state = generateState()
			return await dataSources.database.ExerciseSample.create({ userSkillId: userSkill.id, exerciseId, state, status: 'inProgress' })
		},
	},
	User: {
		skills: async (user, { ids }, { dataSources }) => {
			if (!ids)
				return await dataSources.database.UserSkill.findAll({ where: { userId: user.id } })
			return await dataSources.database.UserSkill.findAll({ where: { userId: user.id, skillId: { [Op.or]: ids } } })
		},
	},
	Skill: {
		id: userSkill => userSkill.skillId,
		name: userSkill => skills[userSkill.skillId].name,
		exercises: async (userSkill, _args, { dataSources }) => await dataSources.database.ExerciseSample.findAll({ where: { userSkillId: userSkill.id } }),
	},
	Exercise: {
		id: exerciseSample => exerciseSample.exerciseId,
		startedOn: exerciseSample => exerciseSample.createdAt,
		submissions: async (exerciseSample, _args, { dataSources }) => await dataSources.database.ExerciseSubmission.findAll({ where: { exerciseSampleId: exerciseSample.id } }),
	},
}

function isExerciseDone(exercise) {
	return (exercise.status === 'solved' || exercise.status === 'givenUp')
}

module.exports = {
	typeDefs, resolvers
}
