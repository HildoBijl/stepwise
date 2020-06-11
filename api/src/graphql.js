const { gql } = require('apollo-server-express')
const { EmailAddressResolver, DateTimeResolver, JSONObjectResolver } = require('graphql-scalars')
const skills = require('step-wise/edu/skills')
const { Op } = require('sequelize')

const typeDefs = gql`
	scalar EmailAddress
	scalar DateTime
	scalar JSON
	enum ExerciseStatus { started solved split splitSolved givenUp }

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
		currentExercise: Exercise
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
		# correct: JSON!
	}

	type Query {
		me: User
		mySkills(ids: [String]): [Skill]
	}

	type Mutation {
		startExercise(skillId: String!): Exercise!
		submitExercise(skillId: String!, input: JSON!, skillIds: [String]): [Skill]!
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
			checkSkillIds(ids)
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

			// Check if the current exercise is done. Also create a userSkill entry if none is present yet.
			let { exercise, userSkill } = await getCurrentSkillExercise(user.id, skillId, dataSources)
			if (!userSkill)
				userSkill = await dataSources.database.UserSkill.create({ userId: user.id, skillId })
			if (exercise)
				throw new Error(`Cannot start a new exercise: the previous one is not done yet.`)

			// ToDo: select the most appropriate exercise for this user.
			const exerciseId = skill.exercises[0] // Temporary: just pick the first.

			// Start the new exercise.
			const { generateState } = require(`step-wise/edu/exercises/${exerciseId}`)
			const state = generateState()
			return await dataSources.database.ExerciseSample.create({ userSkillId: userSkill.id, exerciseId, state, status: 'started' })
		},
		submitExercise: async (_source, { skillId, input, skillIds }, { dataSources, getPrincipal }) => {
			// Check if there is a user.
			const user = getPrincipal()
			if (!user)
				throw new Error(`Cannot submit an exercise: no user is logged in.`)

			// Check if the given skill exists.
			const skill = skills[skillId]
			if (!skill)
				throw new Error(`Cannot submit an exercise: the given skill "${skillId}" does not exist.`)

			// Check if the current exercise is done.
			const { exercise } = await getCurrentSkillExercise(user.id, skillId, dataSources)
			if (!exercise)
				throw new Error(`Cannot submit an exercise: no exercise is open at the moment.`)

			// Grade the input.
			const exerciseId = exercise.exerciseId
			const { checkInput } = require(`step-wise/edu/exercises/${exerciseId}`)
			const correct = checkInput(exercise.state, input) // ToDo: process results into the coefficients.

			// Store the submission and possibly update the status of the exercise.
			const queries = [dataSources.database.ExerciseSubmission.create({ exerciseSampleId: exercise.id, input })]
			if (correct)
				queries.push(exercise.update({ status: exercise.status === 'split' ? 'splitSolved' : 'solved' }))
			await Promise.all(queries)

			// If the user did not request skill data, return only data related to the given skill. Otherwise return the requested skills.
			if (!skillIds)
				skillIds = [skillId]
			checkSkillIds(skillIds)
			if (skillIds.length === 0)
				return []
			return await dataSources.database.UserSkill.findAll({ where: { userId: user.id, skillId: { [Op.or]: skillIds } } })
		},
	},
	User: {
		skills: async (user, { ids }, { dataSources }) => {
			if (!ids)
				return await dataSources.database.UserSkill.findAll({ where: { userId: user.id } })
			checkSkillIds(ids)
			return await dataSources.database.UserSkill.findAll({ where: { userId: user.id, skillId: { [Op.or]: ids } } })
		},
	},
	Skill: {
		id: userSkill => userSkill.skillId,
		name: userSkill => skills[userSkill.skillId].name,
		exercises: async (userSkill, _args, { dataSources }) => await dataSources.database.ExerciseSample.findAll({ where: { userSkillId: userSkill.id } }),
		currentExercise: async (userSkill, _args, { dataSources }) => (await getCurrentSkillExercise(userSkill.userId, userSkill.skillId, dataSources)).exercise,
	},
	Exercise: {
		id: exerciseSample => exerciseSample.exerciseId,
		startedOn: exerciseSample => exerciseSample.createdAt,
		submissions: async (exerciseSample, _args, { dataSources }) => await dataSources.database.ExerciseSubmission.findAll({ where: { exerciseSampleId: exerciseSample.id } }),
	},
}

// checkSkillIds checks an array of skill ids to see if they exist. Throws an error on an unknown skill.
function checkSkillIds(ids) {
	ids.forEach(id => {
		if (!skills[id])
			throw new Error(`Unknown skills "${id}" encountered.`)
	})
}

// isExerciseDone checks whether a given exercise with a "status" parameter is done (solved or given up) or not. Returns a boolean.
function isExerciseDone(exercise) {
	return (exercise.status === 'solved' || exercise.status === 'splitSolved' || exercise.status === 'givenUp')
}

// getCurrentSkillExercise returns { userSkill, exercise } for the given skillId, where exercise is the currently active exercise. It is null if no active exercise exists for the given skill. userSkill is null if no entry exists for this skill in the database (in which case there certainly is no active exercise).
async function getCurrentSkillExercise(userId, skillId, dataSources) {
	// [ToDo: check if this can be done in one query, using a composite primary key or a join.]
	// Extract the user skill from the database.
	const userSkill = await dataSources.database.UserSkill.findOne({ where: { userId, skillId } })
	if (!userSkill)
		return { userSkill, exercise: null }

	// Find the last exercise and see if it's active.
	const exercise = await dataSources.database.ExerciseSample.findOne({ where: { userSkillId: userSkill.id }, order: [['createdAt', 'DESC']] })
	return (!exercise || isExerciseDone(exercise)) ?
		{ userSkill, exercise: null } :
		{ userSkill, exercise }
}

module.exports = {
	typeDefs, resolvers
}
