const { getActiveExerciseData } = require('../util/Exercise')

const resolvers = {
	Exercise: {
		id: exerciseSample => exerciseSample.exerciseId,
		startedOn: exerciseSample => exerciseSample.createdAt,
		submissions: async (exerciseSample, _args, { db }) => await db.ExerciseSubmission.findAll({ where: { exerciseSampleId: exerciseSample.id } }),
	},

	Mutation: {
		startExercise: async (_source, { skillId }, { db, getUserId }) => {
			const { skill, userSkill } = await getActiveExerciseData(getUserId(), skillId, db, false)

			// ToDo: select the most appropriate exercise for this user.
			const exerciseId = skill.exercises[0] // Temporary: just pick the first.

			// Start the new exercise and return it.
			const { generateState } = require(`step-wise/edu/exercises/${exerciseId}`)
			const state = generateState()
			return await userSkill.createExerciseSample({ exerciseId, state, active: true })
		},

		submitExercise: async (_source, { skillId, input }, { db, getUserId }) => {
			const { userSkill, activeExercise } = await getActiveExerciseData(getUserId(), skillId, db, true)

			// Grade the input.
			const exerciseId = activeExercise.exerciseId
			const { checkInput } = require(`step-wise/edu/exercises/${exerciseId}`)
			const correct = checkInput(activeExercise.state, input) // ToDo: process results into the coefficients.

			// Store the submission and on a correct one update the active field of the exercise to solved.
			const queries = [activeExercise.createExerciseSubmission({ input })]
			if (correct) {
				queries.push(activeExercise.update({ active: false }))
			}
			await Promise.all(queries)
			// ToDo: add transactions.

			// Return affected skills.
			return [userSkill]
		},

		splitUpExercise: async (_source, { skillId }, { db, getUserId }) => {
			const { userSkill } = await getActiveExerciseData(getUserId(), skillId, db, true)

			// Split up the exercise.
			// ToDo: add a submission for splitting up.
			// ToDo: update coefficients accordingly.
			// ToDo: add transactions.

			// Return affected skills.
			return [userSkill]
		},

		giveUpExercise: async (_source, { skillId }, { db, getUserId }) => {
			const { userSkill, activeExercise } = await getActiveExerciseData(getUserId(), skillId, db, true)

			// End the exercise. [ToDo: insert a submission for giving up.] [ToDo: update coefficients accordingly.] [ToDo: add transactions.]
			await activeExercise.update({ active: false })

			// Return affected skills.
			return [userSkill]
		},
	},
}

module.exports = resolvers
