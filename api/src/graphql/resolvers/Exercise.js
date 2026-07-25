
const { ensureSkillId } = require('@step-wise/skill-tree')
const { serializeAll, deserializeAll } = require('@step-wise/serialization')
const { getFullExerciseId } = require('@step-wise/exercise-definition')
const { generateSkillBasedExerciseInstance } = require('@step-wise/exercise-selection')
const { getExercises, getExerciseByFullId } = require('@step-wise/exercises')

const { events: skillEvents, getUserSkill } = require('../util/Skill')
const { getUserSkillLevelSet, applySkillUpdatesForUser } = require('../util/SkillCoefficients')
const { getLastEvent, getExerciseProgress } = require('../util/Exercise')

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
		history: exercise => exercise.events || [],
		active: exercise => exercise.active && !!getExerciseByFullId(exercise.exerciseId), // Only show active when the exercise also still exists.
	},

	Event: {
		performedAt: event => event.createdAt,
	},

	Mutation: {
		startExercise: async (_source, { skillId }, { db, ensureLoggedIn, userId }) => {
			// Check input: the user must be logged in, the skillId must exist, and there must not be an active exercise.
			ensureLoggedIn()
			ensureSkillId(skillId)
			const { skill, exercises: previousExercises } = await getUserSkill(db, userId, skillId, { includeExercises: true, requireNoActiveExercise: true, createIfNoneExists: true })

			// Select a new exercise, store it and return the result.
			const skillExercises = getExercises(skillId)
			const getSkillLevelSet = (skillIds) => getUserSkillLevelSet(db, userId, skillIds)
			const newExercise = await generateSkillBasedExerciseInstance(skillExercises, getSkillLevelSet, previousExercises)
			return await skill.createExercise({ exerciseId: getFullExerciseId(skillId, newExercise.exerciseId), state: serializeAll(newExercise.state), active: true })
		},

		submitExerciseAction: async (_source, { skillId, action }, { db, pubsub, ensureLoggedIn, userId }) => {
			ensureLoggedIn()

			// Get the currently active exercise.
			const { activeExercise } = await getUserSkill(db, userId, skillId, { includeActiveExercise: true, requireActiveExercise: true })

			// Set up an updateSkills handler that collects the updates that need to be done.
			const skillUpdates = []
			const updateSkills = (setup, correct) => {
				if (setup)
					skillUpdates.push({ setup, correct, userId })
			}

			// Update the progress parameter.
			const previousProgress = getExerciseProgress(activeExercise)
			const exercise = getExerciseByFullId(activeExercise.exerciseId)
			if (!exercise)
				throw new Error(`Invalid exercise: could not load the exercise with ID "${activeExercise.exerciseId}".`)
			const progress = exercise.processAction({ action, state: deserializeAll(activeExercise.state), progress: previousProgress, history: activeExercise.events, updateSkills })
			if (!progress)
				throw new Error(`Invalid progress object: could not process action for exercise "${activeExercise.exerciseId}" due to an error in updating the exercise progress.`)

			// Process the collected updates and save them.
			let adjustedSkills
			await db.transaction(async (transaction) => {
				// Apply all the skill updates that were collected so far.
				adjustedSkills = await applySkillUpdatesForUser(db, userId, skillUpdates, transaction)

				// Store the submission and on a correct one update the active field of the exercise to solved.
				const newEvent = await activeExercise.createEvent({ action, progress }, { transaction })
				activeExercise.events.push(newEvent)
				if (progress.done) {
					await activeExercise.update({ active: false }, { transaction })
					activeExercise.active = false
				}
			})

			// Update the skills through the web socket connection.
			await pubsub.publish(skillEvents.skillsUpdated, { updatedSkills: adjustedSkills, userId })

			// Return all required data.
			return {
				updatedExercise: activeExercise,
				adjustedSkills,
			}
		},
	},
}
module.exports = resolvers
