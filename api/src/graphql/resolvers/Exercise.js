const skills = require('step-wise/edu/skills')
const { getSkills } = require('../util/Skill')
const { getCurrentExerciseOfSkill } = require('../util/Exercise')

const resolvers = {
	Exercise: {
		id: exerciseSample => exerciseSample.exerciseId,
		startedOn: exerciseSample => exerciseSample.createdAt,
		submissions: async (exerciseSample, _args, { db }) => await db.ExerciseSubmission.findAll({ where: { exerciseSampleId: exerciseSample.id } }),
	},

	Mutation: {
		startExercise: async (_source, { skillId }, { db, getUser }) => {
			// Check if there is a user.
			const user = await getUser()
			if (!user)
				throw new Error(`Cannot start a new exercise for the skill "${skillId}": no user is logged in.`)

			// Check if the given skill exists.
			const skill = skills[skillId]
			if (!skill)
				throw new Error(`Cannot start a new exercise for the skill "${skillId}": the given skill "${skillId}" does not exist.`)

			// Check if the current exercise is done. Also create a userSkill entry if none is present yet.
			let { exercise, userSkill } = await getCurrentExerciseOfSkill(user.id, skillId, db)
			if (!userSkill)
				userSkill = await db.UserSkill.create({ userId: user.id, skillId })
			if (exercise)
				throw new Error(`Cannot start a new exercise for the skill "${skillId}": the previous one is not done yet.`)

			// ToDo: select the most appropriate exercise for this user.
			const exerciseId = skill.exercises[0] // Temporary: just pick the first.

			// Start the new exercise.
			const { generateState } = require(`step-wise/edu/exercises/${exerciseId}`)
			const state = generateState()
			exercise = await db.ExerciseSample.create({ userSkillId: userSkill.id, exerciseId, state, active: true })
			userSkill.update({ currentExerciseId: exercise.id }) // ToDo: check if we need to wait on this?
			return exercise
		},

		submitExercise: async (_source, { skillId, input, skillIds }, { db, getUser }) => {
			// Check if there is a user.
			const user = await getUser()
			if (!user)
				throw new Error(`Cannot submit a solution for the skill "${skillId}": no user is logged in.`)

			// Check if the given skill exists.
			const skill = skills[skillId]
			if (!skill)
				throw new Error(`Cannot submit a solution for the skill "${skillId}": the given skill "${skillId}" does not exist.`)

			// Check if the current exercise is done.
			const { exercise, userSkill } = await getCurrentExerciseOfSkill(user.id, skillId, db)
			if (!exercise)
				throw new Error(`Cannot submit a solution for the skill "${skillId}": no exercise is open at the moment.`)

			// Grade the input.
			const exerciseId = exercise.exerciseId
			const { checkInput } = require(`step-wise/edu/exercises/${exerciseId}`)
			const correct = checkInput(exercise.state, input) // ToDo: process results into the coefficients.

			// Store the submission and on a correct one update the active field of the exercise to solved.
			const queries = [db.ExerciseSubmission.create({ exerciseSampleId: exercise.id, input })]
			if (correct) {
				queries.push(exercise.update({ active: false }))
				queries.push(userSkill.update({ currentExerciseId: null }))
			}
			await Promise.all(queries)

			// Return appropriate skill data. [ToDo: consider returning only affected skills and doing so automatically.]
			return await getSkills(user.id, skillIds || [skillId], db)
		},

		splitUpExercise: async (_source, { skillId, skillIds }, { db, getUser }) => {
			// Check if there is a user.
			const user = await getUser()
			if (!user)
				throw new Error(`Cannot split up the current exercise for the skill "${skillId}": no user is logged in.`)

			// Check if the given skill exists.
			const skill = skills[skillId]
			if (!skill)
				throw new Error(`Cannot split up the current exercise for the skill "${skillId}": the given skill "${skillId}" does not exist.`)

			// Check if the current exercise can be split up.
			let { exercise } = await getCurrentExerciseOfSkill(user.id, skillId, db)
			if (!exercise)
				throw new Error(`Cannot split up the current exercise for the skill "${skillId}": no exercise is open at the moment.`)

			// Split up the exercise.
			// ToDo: add a submission for splitting up.
			// ToDo: update coefficients accordingly.

			// Return appropriate skill data. [ToDo: consider returning only affected skills and doing so automatically.]
			return await getSkills(user.id, skillIds || [skillId], db)
		},

		giveUpExercise: async (_source, { skillId, skillIds }, { db, getUser }) => {
			// Check if there is a user.
			const user = await getUser()
			if (!user)
				throw new Error(`Cannot give up the current exercise for the skill "${skillId}": no user is logged in.`)

			// Check if the given skill exists.
			const skill = skills[skillId]
			if (!skill)
				throw new Error(`Cannot give up the current exercise for the skill "${skillId}": the given skill "${skillId}" does not exist.`)

			// Check if the current exercise can be split up.
			let { exercise, userSkill } = await getCurrentExerciseOfSkill(user.id, skillId, db)
			if (!exercise)
				throw new Error(`Cannot give up the current exercise for the skill "${skillId}": no exercise is open at the moment.`)

			// Split up the exercise. [ToDo: insert a submission for giving up.] [ToDo: update coefficients accordingly.]
			await exercise.update({ active: false })

			// Return appropriate skill data. [ToDo: consider returning only affected skills and doing so automatically.]
			return await getSkills(user.id, skillIds || [skillId], db)
		},
	},
}

module.exports = resolvers
