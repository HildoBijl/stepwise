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
			activeEvent.actions = []
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

		cancelGroupAction: async (_source, { code, skillId }, { db, getCurrentUserId }) => {
			// Load and verify data.
			const userId = getCurrentUserId()
			const group = await getGroupWithActiveSkillExercise(code, skillId, db)
			verifyGroupAccess(group, userId)
			const exercise = group.exercises[0]
			if (!exercise)
				throw new UserInputError(`Could not cancel group action. The group ${group.code} does not have an active exercise.`)
			const activeEvent = exercise.events.find(event => event.progress === null)
			if (!activeEvent)
				throw new UserInputError(`Could not cancel group action. The group ${group.code} does not have an active event.`)

			// Load in the user action and delete it if it exists.
			const userAction = activeEvent.actions && activeEvent.actions.find(action => action.userId === userId)
			if (userAction) {
				userAction.destroy()
				activeEvent.actions = activeEvent.actions.filter(action => action.id !== userAction.id)
			}

			// Return the exercise as result.
			// ToDo: pubsub event.
			return exercise
		},

		resolveGroupEvent: async (_source, { code, skillId }, { db, getCurrentUserId }) => {
			// Load and verify data.
			const userId = getCurrentUserId()
			const group = await getGroupWithActiveSkillExercise(code, skillId, db)
			verifyGroupAccess(group, userId)
			const exercise = group.exercises[0]
			if (!exercise)
				throw new UserInputError(`Could not resolve group event. The group ${group.code} does not have an active exercise.`)
			const activeEvent = exercise.events.find(event => event.progress === null)
			if (!activeEvent)
				throw new UserInputError(`Could not resolve group event. The group ${group.code} does not have an active event.`)

			// Check if it can be submitted. This is only when at least two active members are present and all active members have submitted.
			const activeMembers = group.members.filter(member => member.groupMembership.active)
			if (activeMembers.length < 2)
				throw new UserInputError(`Could not resolve group event. The group ${group.code} does not have sufficient users present.`)
			if (activeMembers.some(member => !activeEvent.actions.some(action => action.userId === member.id)))
				throw new UserInputError(`Could not resolve group event. Not every active user in group ${group.code} has submitted an action.`)

			// Define how to update skills data.
			const updateSkills = (...args) => { } // ToDo later

			// Check the exercise, getting an updated progress. Store this and prepare for a new event.
			const state = toFO(exercise.state)
			const actions = activeEvent.actions.map(action => ({ ...action.action, userId: action.userId }))
			const previousProgress = getGroupExerciseProgress(exercise)
			const { processAction } = require(`step-wise/edu/exercises/exercises/${exercise.exerciseId}`)
			const progress = processAction({ actions, state, progress: previousProgress, history: exercise.events, updateSkills })

			// Store the progress in the active event. If the exercise is done, note this. If not, prepare for future submissions.
			await activeEvent.update({ progress })
			activeEvent.progress = progress
			if (progress.done) {
				await exercise.update({ active: false })
				exercise.active = false
			} else {
				const newActiveEvent = await exercise.createEvent({ progress: null })
				newActiveEvent.actions = []
				exercise.events = [...exercise.events, newActiveEvent]
			}

			// ToDo later: update skill data. See the Exercise file for how to set it up.

			// Return the exercise as a result.
			// ToDo: pubsub
			return exercise
		},
	},
}
module.exports = resolvers
