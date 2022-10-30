const { UserInputError } = require('apollo-server-express')

const { toFO, toSO } = require('step-wise/inputTypes')
const skills = require('step-wise/edu/skills')
const { getNewRandomExercise } = require('step-wise/edu/exercises/util/selection')

const { verifyGroupAccess, getGroupExerciseProgress, getGroupWithActiveExercises, getGroupWithActiveSkillExercise, processGroupExercises, processExercise } = require('../util/GroupExercise')

const resolvers = {
	GroupExercise: {
		startedOn: exercise => exercise.createdAt,
		progress: exercise => getGroupExerciseProgress(exercise),
		history: exercise => exercise.events || [],
	},

	GroupEvent: {
		performedAt: event => event.updatedAt,
	},

	GroupAction: {
		performedAt: action => action.updatedAt,
	},

	Query: {
		activeGroupExercises: async (_source, { code }, { db, getCurrentUserId }) => {
			const group = await getGroupWithActiveExercises(code, db)
			verifyGroupAccess(group, getCurrentUserId())
			return group.exercises
		},
	},

	Mutation: {
		startGroupExercise: async (_source, { code, skillId }, { db, getCurrentUserId }) => {
			// Verify that the user is a member of the given group.
			const group = await getGroupWithActiveSkillExercise(code, skillId, db)
			verifyGroupAccess(group, getCurrentUserId())

			// If an active group exercise already exists, return this. (If two users start one at the same time, then at least no error is thrown.)
			if (group.exercises.length > 0)
				return processGroupExercises(group).exercises[0]

			// Select a new exercise, store it, and right away add an empty event to couple actions to.
			const newExercise = await getNewRandomExercise(skillId)
			const exercise = await group.createExercise({ skillId, exerciseId: newExercise.exerciseId, state: toSO(newExercise.state), active: true })
			const activeEvent = await exercise.createEvent({ progress: null })
			exercise.events = [activeEvent]

			// Return the exercise as result.
			// ToDo: pubsub event.
			return exercise
		},

		submitGroupAction: async (_source, { code, skillId, action }, { db, getCurrentUserId }) => {
			// Load and verify data.
			const userId = getCurrentUserId()
			const group = await getGroupWithActiveSkillExercise(code, skillId, db)
			verifyGroupAccess(group, userId)
			const exercise = group.exercises[0]
			if (!exercise)
				throw new UserInputError(`Could not submit group action. The group ${group.code} does not have an active exercise.`)

			// If there is no active event (should never happen) then add one.
			let activeEvent = exercise.events.find(event => event.progress === null)
			if (!activeEvent) {
				activeEvent = await exercise.createEvent({ progress: null })
				activeEvent.actions = []
				exercise.events = [activeEvent]
			}

			// If there is already an action for the user, overwrite it. Otherwise add it.
			const userAction = activeEvent.actions.find(action => action.userId === userId)
			if (userAction) {
				const newAction = await userAction.update({ action })
				activeEvent.actions = activeEvent.actions.map(action => action.id === newAction.id ? newAction : action)
			} else {
				const newAction = await activeEvent.createAction({ userId, action })
				activeEvent.actions = [...activeEvent.actions, newAction]
			}

			// Return the exercise as result.
			// ToDo: pubsub event.
			return exercise
		},
		cancelGroupAction: async (_source, { skillId, action }, { db, getCurrentUserId }) => {
		},
		resolveGroupEvent: async (_source, { skillId, action }, { db, getCurrentUserId }) => {
		},
	},
}
module.exports = resolvers
