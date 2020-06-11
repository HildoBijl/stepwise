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
		splitUpExercise(skillId: String!, skillIds: [String]): [Skill]!
		giveUpExercise(skillId: String!, skillIds: [String]): [Skill]!
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
				throw new Error(`Cannot start a new exercise for the skill "${skillId}": no user is logged in.`)

			// Check if the given skill exists.
			const skill = skills[skillId]
			if (!skill)
				throw new Error(`Cannot start a new exercise for the skill "${skillId}": the given skill "${skillId}" does not exist.`)

			// Check if the current exercise is done. Also create a userSkill entry if none is present yet.
			let { exercise, userSkill } = await getCurrentSkillExercise(user.id, skillId, dataSources)
			if (!userSkill)
				userSkill = await dataSources.database.UserSkill.create({ userId: user.id, skillId })
			if (exercise)
				throw new Error(`Cannot start a new exercise for the skill "${skillId}": the previous one is not done yet.`)

			// ToDo: select the most appropriate exercise for this user.
			const exerciseId = skill.exercises[0] // Temporary: just pick the first.

			// Start the new exercise.
			const { generateState } = require(`step-wise/edu/exercises/${exerciseId}`)
			const state = generateState()
			exercise = await dataSources.database.ExerciseSample.create({ userSkillId: userSkill.id, exerciseId, state, status: 'started' })
			userSkill.update({ currentExerciseId: exercise.id }) // ToDo: check if we need to wait on this?
			return exercise
		},
		submitExercise: async (_source, { skillId, input, skillIds }, { dataSources, getPrincipal }) => {
			// Check if there is a user.
			const user = getPrincipal()
			if (!user)
				throw new Error(`Cannot submit a solution for the skill "${skillId}": no user is logged in.`)

			// Check if the given skill exists.
			const skill = skills[skillId]
			if (!skill)
				throw new Error(`Cannot submit a solution for the skill "${skillId}": the given skill "${skillId}" does not exist.`)

			// Check if the current exercise is done.
			const { exercise, userSkill } = await getCurrentSkillExercise(user.id, skillId, dataSources)
			if (!exercise)
				throw new Error(`Cannot submit a solution for the skill "${skillId}": no exercise is open at the moment.`)

			// Grade the input.
			const exerciseId = exercise.exerciseId
			const { checkInput } = require(`step-wise/edu/exercises/${exerciseId}`)
			const correct = checkInput(exercise.state, input) // ToDo: process results into the coefficients.

			// Store the submission and on a correct one update the status of the exercise to solved.
			const queries = [dataSources.database.ExerciseSubmission.create({ exerciseSampleId: exercise.id, input })]
			if (correct) {
				queries.push(exercise.update({ status: exercise.status === 'split' ? 'splitSolved' : 'solved' }))
				queries.push(userSkill.update({ currentExerciseId: null }))
			}
			await Promise.all(queries)

			// Return appropriate skill data.
			return await getSkills(user.id, skillIds || [skillId], dataSources)
		},
		splitUpExercise: async (_source, { skillId, skillIds }, { dataSources, getPrincipal }) => {
			// Check if there is a user.
			const user = getPrincipal()
			if (!user)
				throw new Error(`Cannot split up the current exercise for the skill "${skillId}": no user is logged in.`)

			// Check if the given skill exists.
			const skill = skills[skillId]
			if (!skill)
				throw new Error(`Cannot split up the current exercise for the skill "${skillId}": the given skill "${skillId}" does not exist.`)

			// Check if the current exercise can be split up.
			let { exercise, userSkill } = await getCurrentSkillExercise(user.id, skillId, dataSources)
			if (!exercise)
				throw new Error(`Cannot split up the current exercise for the skill "${skillId}": no exercise is open at the moment.`)
			if (exercise.status !== 'started')
				throw new Error(`Cannot split up the current exercise for the skill "${skillId}": it has already been split up.`)

			// Split up the exercise.
			await exercise.update({ status: 'split' }) // ToDo: update coefficients accordingly.

			// Return appropriate skill data.
			return await getSkills(user.id, skillIds || [skillId], dataSources)
		},
		giveUpExercise: async (_source, { skillId, skillIds }, { dataSources, getPrincipal }) => {
			// Check if there is a user.
			const user = getPrincipal()
			if (!user)
				throw new Error(`Cannot give up the current exercise for the skill "${skillId}": no user is logged in.`)

			// Check if the given skill exists.
			const skill = skills[skillId]
			if (!skill)
				throw new Error(`Cannot give up the current exercise for the skill "${skillId}": the given skill "${skillId}" does not exist.`)

			// Check if the current exercise can be split up.
			let { exercise, userSkill } = await getCurrentSkillExercise(user.id, skillId, dataSources)
			if (!exercise)
				throw new Error(`Cannot give up the current exercise for the skill "${skillId}": no exercise is open at the moment.`)
			if (exercise.status !== 'split')
				throw new Error(`Cannot give up the current exercise for the skill "${skillId}": only split-up exercises can be given up.`)

			// Split up the exercise.
			await exercise.update({ status: 'givenUp' }) // ToDo: update coefficients accordingly.

			// Return appropriate skill data.
			return await getSkills(user.id, skillIds || [skillId], dataSources)
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

// checkSkillIds checks an array of skillIds to see if they exist. Throws an error on an unknown skill.
function checkSkillIds(ids) {
	ids.forEach(id => {
		if (!skills[id])
			throw new Error(`Unknown skills "${id}" encountered.`)
	})
}

// getSkills uses a userId and an array of skillIds to get data from the database.
async function getSkills(userId, skillIds = [], dataSources) {
	checkSkillIds(skillIds)
	if (skillIds.length === 0)
		return []
	return await dataSources.database.UserSkill.findAll({ where: { userId, skillId: { [Op.or]: skillIds } } })
}

// isExerciseDone checks whether a given exercise with a "status" parameter is done (solved or given up) or not. Returns a boolean.
function isExerciseDone(exercise) {
	return (exercise.status === 'solved' || exercise.status === 'splitSolved' || exercise.status === 'givenUp')
}

// getCurrentSkillExercise returns { userSkill, exercise } for the given userId and skillId, where exercise is the currently active exercise. It is null if no active exercise exists for the given skill. userSkill is null if no entry exists for this skill in the database (in which case there certainly is no active exercise).
async function getCurrentSkillExercise(userId, skillId, dataSources) {
	// [ToDo: check if this can be done in one query, using a composite primary key or a join.]
	// Extract the user skill from the database.
	const userSkill = await dataSources.database.UserSkill.findOne({ where: { userId, skillId } })
	if (!userSkill || !userSkill.currentExerciseId)
		return { userSkill, exercise: null }

	// Find the last exercise and see if it's active. (It should be, but just in case.)
	const exercise = await dataSources.database.ExerciseSample.findByPk(userSkill.currentExerciseId)
	return (!exercise || isExerciseDone(exercise)) ?
		{ userSkill, exercise: null } :
		{ userSkill, exercise }
}

module.exports = {
	typeDefs, resolvers
}
