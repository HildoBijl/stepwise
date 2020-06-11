const skills = require('step-wise/edu/skills')
const { getSkills } = require('../util/Skill')
const { getCurrentExerciseOfSkill } = require('../util/Exercise')

const resolvers = {
	Exercise: {
		id: exerciseSample => exerciseSample.exerciseId,
		startedOn: exerciseSample => exerciseSample.createdAt,
		submissions: async (exerciseSample, _args, { dataSources }) => await dataSources.database.ExerciseSubmission.findAll({ where: { exerciseSampleId: exerciseSample.id } }),
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
			let { exercise, userSkill } = await getCurrentExerciseOfSkill(user.id, skillId, dataSources)
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
			const { exercise, userSkill } = await getCurrentExerciseOfSkill(user.id, skillId, dataSources)
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

			// Return appropriate skill data. [ToDo: consider returning only affected skills and doing so automatically.]
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
			let { exercise } = await getCurrentExerciseOfSkill(user.id, skillId, dataSources)
			if (!exercise)
				throw new Error(`Cannot split up the current exercise for the skill "${skillId}": no exercise is open at the moment.`)
			if (exercise.status !== 'started')
				throw new Error(`Cannot split up the current exercise for the skill "${skillId}": it has already been split up.`)

			// Split up the exercise.
			await exercise.update({ status: 'split' }) // ToDo: update coefficients accordingly.

			// Return appropriate skill data. [ToDo: consider returning only affected skills and doing so automatically.]
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
			let { exercise, userSkill } = await getCurrentExerciseOfSkill(user.id, skillId, dataSources)
			if (!exercise)
				throw new Error(`Cannot give up the current exercise for the skill "${skillId}": no exercise is open at the moment.`)
			if (exercise.status !== 'split')
				throw new Error(`Cannot give up the current exercise for the skill "${skillId}": only split-up exercises can be given up.`)

			// Split up the exercise. [ToDo: update coefficients accordingly.]
			queries = [
				exercise.update({ status: 'givenUp' }),
				userSkill.update({ currentExerciseId: null }),
			]
			await Promise.all(queries)

			// Return appropriate skill data. [ToDo: consider returning only affected skills and doing so automatically.]
			return await getSkills(user.id, skillIds || [skillId], dataSources)
		},
	},
}

module.exports = resolvers
