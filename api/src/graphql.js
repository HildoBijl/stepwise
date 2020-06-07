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
		correct: Boolean!
	}

	type Query {
		me: User
		mySkills(ids: [String]): [Skill]
	}

	# type Mutation {
		# startExercise(skillId: String!): Exercise!
		# submitExercise(skillId: String!, input: JSON!): [Skill]!
		# splitUpExercise(skillId: String!): [Skill]!
		# giveUpExercise(skillId: String!): [Skill]!
	# }
`

const resolvers = {
	EmailAddress: EmailAddressResolver,
	DateTime: DateTimeResolver,
	JSON: JSONObjectResolver,

	Query: {
		me: async (_source, _args, { dataSources, getPrincipal }) => {
			if (!getPrincipal())
				return null
			return await dataSources.database.User.findByPk(getPrincipal().id)
		},
		mySkills: async (_source, { ids }, { dataSources, getPrincipal }) => {
			if (!getPrincipal())
				return null
			if (!ids)
				return await dataSources.database.UserSkill.findAll({ where: { userId: getPrincipal().id } })
			return await dataSources.database.UserSkill.findAll({ where: { userId: getPrincipal().id, skillId: { [Op.or]: ids } } })
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

module.exports = {
	typeDefs, resolvers
}
