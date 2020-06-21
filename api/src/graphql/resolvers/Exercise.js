const { getNewExercise } = require('step-wise/edu/util/exercises')
const { getLastAction, getExerciseProgress, getActiveExerciseData } = require('../util/Exercise')

const resolvers = {
	Exercise: {
		id: exercise => exercise.exerciseId,
		startedOn: exercise => exercise.createdAt,
		lastAction: exercise => getLastAction(exercise),
		progress: exercise => getExerciseProgress(exercise),
		actions: exercise => exercise.actions || [],
	},

	Mutation: {
		startExercise: async (_source, { skillId }, { db, getUserId }) => {
			const { skill } = await getActiveExerciseData(getUserId(), skillId, db, false)

			// Select a new exercise, store it and return the result.
			const newExercise = getNewExercise(skillId) // ToDo: add skill data to make a more informed decision.
			return await skill.createExercise({ exerciseId: newExercise.id, state: newExercise.state, active: true })
		},

		processExerciseAction: async (_source, { skillId, action }, { db, getUserId }) => {
			const { exercise } = await getActiveExerciseData(getUserId(), skillId, db, true)

			// Update the progress parameter.
			const prevProgress = getExerciseProgress(exercise)
			const { processAction } = require(`step-wise/edu/exercises/${exercise.exerciseId}`)
			const progress = processAction({ action, state: exercise.state, progress: prevProgress, updateSkills: () => console.log('ToDo: enable skill updating') })

			// Store the submission and on a correct one update the active field of the exercise to solved.
			const newAction = await exercise.createAction({ action, progress })
			exercise.actions.push(newAction) // In Sequelize we have to manually add the new action to the current object. 
			if (progress.done)
				await exercise.update({ active: false })
			// ToDo: add transactions.
			
			// Return all required data.
			return {
				updatedExercise: exercise,
				adjustedSkills: [], // ToDo: add affected skills.
			}
		},
	},
}

module.exports = resolvers
