
const { toFO, toSO } = require('step-wise/inputTypes')
const { getNewExercise } = require('step-wise/edu/exercises/util/selection')

const { getLastEvent, getExerciseProgress, getActiveExerciseData } = require('../util/Exercise')
const { events: skillEvents, getUserSkillDataSet } = require('../util/Skill')
const { applySkillUpdatesForUser } = require('../util/Exercise')

const resolvers = {
	Exercise: {
		startedOn: exercise => exercise.createdAt,
		progress: exercise => getExerciseProgress(exercise),
		lastAction: exercise => {
			const lastEvent = getLastEvent(exercise)
			return (lastEvent && lastEvent.action) || null
		},
		lastActionAt: exercise => {
			const lastEvent = getLastEvent(exercise)
			return (lastEvent && lastEvent.createdAt) || null
		},
		history: exercise => (exercise.events || []).sort((a, b) => a.createdAt - b.createdAt) || [], // Sort the history ascending by date.,
	},

	Event: {
		performedAt: event => event.createdAt,
	},

	Mutation: {
		startExercise: async (_source, { skillId }, { db, getCurrentUserId }) => {
			const userId = getCurrentUserId()
			const { skill } = await getActiveExerciseData(userId, skillId, db, false)

			// Select a new exercise, store it and return the result.
			const getSkillDataSet = (skillIds) => getUserSkillDataSet(userId, skillIds, db)
			const newExercise = await getNewExercise(skillId, getSkillDataSet)
			return await skill.createExercise({ exerciseId: newExercise.exerciseId, state: toSO(newExercise.state), active: true })
		},

		submitExerciseAction: async (_source, { skillId, action }, { db, pubsub, getCurrentUserId }) => {
			const userId = getCurrentUserId()
			const { exercise } = await getActiveExerciseData(userId, skillId, db, true)

			// Set up an updateSkills handler that only collects calls.
			const skillUpdates = []
			const updateSkills = (setup, correct) => {
				if (setup)
					skillUpdates.push({ setup, correct, userId })
			}

			// Update the progress parameter.
			const previousProgress = getExerciseProgress(exercise)
			const { processAction } = require(`step-wise/edu/exercises/exercises/${exercise.exerciseId}`)
			const progress = processAction({ action, state: toFO(exercise.state), progress: previousProgress, history: exercise.events, updateSkills })
			if (!progress)
				throw new Error(`Invalid progress object: could not process action due to an error in updating the exercise progress.`)

			// Time to store things in the database.
			let adjustedSkills
			await db.transaction(async (transaction) => {
				// Apply all the skill updates that were collected so far.
				adjustedSkills = await applySkillUpdatesForUser(skillUpdates, userId, db, transaction)

				// Store the submission and on a correct one update the active field of the exercise to solved.
				const newEvent = await exercise.createEvent({ action, progress }, { transaction })
				exercise.events.push(newEvent) // In Sequelize we have to manually add the new action to the current object.
				if (progress.done) {
					await exercise.update({ active: false }, { transaction })
					exercise.active = false
				}
			})

			// Update the skills through the web socket connection.
			await pubsub.publish(skillEvents.skillsUpdated, { updatedSkills: adjustedSkills, userId })

			// Return all required data.
			return {
				updatedExercise: exercise,
				adjustedSkills,
			}
		},
	},
}
module.exports = resolvers
