import { UserInputError } from '../../errors.ts'
import { Op } from 'sequelize'

import { findOptimum } from '@step-wise/js-utils'
import { generateRandomExerciseInstance } from '@step-wise/exercise-selection'
import { getExercises, getExercise } from '@step-wise/exercises'

import { getSubscription } from '../subscriptions.ts'
import { groupEvents, getGroup, verifyGroupAccess } from '../group/index.ts'
import { skillEvents, applySkillUpdates } from '../skill/index.ts'
import { groupExerciseEvents, getGroupExerciseState, getGroupWithAllExercises, getGroupWithActiveExercises, getGroupWithActiveSkillExercise } from './service.ts'

type ResolverTree = { [key: string]: ResolverTree | ((...args: any[]) => any) }

function getGroupEventPerformedAt(event: any): any {
	return findOptimum(event.actions.map((userAction: any) => userAction.updatedAt), (a: any, b: any) => a > b) || event.updatedAt
}

export const groupExerciseResolvers: ResolverTree = {
	GroupExercise: {
		mode: () => 'group',
		startedOn: exercise => exercise.createdAt,
		state: exercise => getGroupExerciseState(exercise),
		history: exercise => [...(exercise.events || [])].sort((a: any, b: any) => a.createdAt - b.createdAt), // Sort the history ascending by date.
	},

	GroupEvent: {
		__resolveType: event => event.state === null ? 'PendingGroupEvent' : 'ResolvedGroupEvent',
	},

	ResolvedGroupEvent: {
		performedAt: getGroupEventPerformedAt,
	},

	PendingGroupEvent: {
		performedAt: getGroupEventPerformedAt,
	},

	GroupExerciseAction: {
		performedAt: userAction => userAction.updatedAt,
	},

	Query: {
		activeGroupExercises: async (_source, { code }, { db, ensureLoggedIn, userId }) => {
			ensureLoggedIn()
			const group = await getGroupWithActiveExercises(code, db)
			verifyGroupAccess(group, userId)
			return group.exercises
		},
	},

	Mutation: {
		leaveGroup: async (_source, { code }, { db, pubsub, ensureLoggedIn, userId }) => {
			// Load the group and check how many users are left.
			ensureLoggedIn()
			const group = await getGroup(db, code, true)
			group.members = group.members.filter((member: any) => member.id !== userId)

			// When the group is left empty, remove it entirely. Otherwise remove all traces from the user.
			if (group.members.length === 0) {
				await group.destroy()
				await pubsub.publish(groupEvents.groupUpdated, { updatedGroup: group, userId, action: 'destroy' })
			} else {
				// Get all user action IDs that have to be removed.
				const groupWithExercises = await getGroupWithAllExercises(code, db)
				const exerciseList: any[] = []
				const userActionIdList: string[] = []
				groupWithExercises.exercises.forEach((exercise: any) => {
					// If the user never did anything in this exercise, ignore it.
					if (!exercise.events.some((event: any) => event.actions.some((userAction: any) => userAction.userId === userId))) return

					// Remember the exercise and all actions that the user did in it.
					exerciseList.push(exercise)
					exercise.events.forEach((event: any) => {
						event.actions.forEach((userAction: any) => {
							if (userAction.userId === userId) userActionIdList.push(userAction.id)
						})
						event.actions = event.actions.filter((userAction: any) => userAction.userId !== userId)
					})
				})

				// Remove the user and all its actions. (Including the userId is technically not needed, but still wise for security reasons.)
				await group.removeMember(userId)
				await db.GroupExerciseAction.destroy({ where: { userId, id: { [Op.in]: userActionIdList } } })

				// Publish events about each of the active exercises and on the updated group.
				const activeExercises = exerciseList.filter((exercise: any) => exercise.active)
				await Promise.all(activeExercises.map(async exercise => await pubsub.publish(groupExerciseEvents.groupExerciseUpdated, { updatedGroupExercise: exercise, code, action: 'resolveEvent' })))
				await pubsub.publish(groupEvents.groupUpdated, { updatedGroup: group, userId, action: 'leave' })
			}

			return true
		},

		startGroupExercise: async (_source, { code, skillId }, { db, pubsub, ensureLoggedIn, userId }) => {
			// Verify that the user is a member of the given group.
			ensureLoggedIn()
			const group = await getGroupWithActiveSkillExercise(code, skillId, db)
			verifyGroupAccess(group, userId)

			// If an active group exercise already exists, return this. (So if two users start an exercise at the same time, this prevents an error.)
			if (group.exercises.length > 0) return group.exercises[0]

			// Select a new exercise, store it, and right away add an empty event to couple actions to.
			const skillExercises = getExercises(skillId)!
			const newExercise = generateRandomExerciseInstance(skillExercises, 'group')
			const exercise = await group.createExercise({ skillId, exerciseId: newExercise.exerciseId, parameters: newExercise.parameters, initialState: newExercise.initialState, active: true })
			const activeEvent = await exercise.createEvent({ state: null })
			activeEvent.actions = []
			exercise.events = [activeEvent]

			// Return the exercise as result.
			await pubsub.publish(groupExerciseEvents.groupExerciseUpdated, { updatedGroupExercise: exercise, code, action: 'startExercise' })
			return exercise
		},

		submitGroupAction: async (_source, { code, skillId, action }, { db, pubsub, ensureLoggedIn, userId }) => {
			// Load and verify data.
			ensureLoggedIn()
			const group = await getGroupWithActiveSkillExercise(code, skillId, db)
			verifyGroupAccess(group, userId)
			const activeExercise = group.exercises[0]
			if (!activeExercise) throw new UserInputError(`Could not submit group action. The group ${group.code} does not have an active exercise.`)

			// If there is no active event (should never happen) then add one.
			let activeEvent = activeExercise.events.find((event: any) => event.state === null)
			if (!activeEvent) {
				activeEvent = await activeExercise.createEvent({ state: null })
				activeEvent.actions = []
				activeExercise.events = [activeEvent]
			}

			// If there is already an action for the user, overwrite it. Otherwise add it.
			const currentUserAction = activeEvent.actions.find((userAction: any) => userAction.userId === userId)
			if (currentUserAction) {
				const newUserAction = await currentUserAction.update({ action })
				activeEvent.actions = activeEvent.actions.map((userAction: any) => userAction.id === newUserAction.id ? newUserAction : userAction)
			} else {
				const newUserAction = await activeEvent.createAction({ userId, action })
				activeEvent.actions = [...activeEvent.actions, newUserAction]
			}

			// Return the exercise as result.
			await pubsub.publish(groupExerciseEvents.groupExerciseUpdated, { updatedGroupExercise: activeExercise, code, action: 'submitAction' })
			return activeExercise
		},

		cancelGroupAction: async (_source, { code, skillId }, { db, pubsub, ensureLoggedIn, userId }) => {
			// Load and verify data.
			ensureLoggedIn()
			const group = await getGroupWithActiveSkillExercise(code, skillId, db)
			verifyGroupAccess(group, userId)
			const activeExercise = group.exercises[0]
			if (!activeExercise) throw new UserInputError(`Could not cancel group action. The group ${group.code} does not have an active exercise.`)
			const activeEvent = activeExercise.events.find((event: any) => event.state === null)
			if (!activeEvent) throw new UserInputError(`Could not cancel group action. The group ${group.code} does not have an active event.`)

			// Load the user's action and delete it if it exists.
			const currentUserAction = activeEvent.actions && activeEvent.actions.find((userAction: any) => userAction.userId === userId)
			if (currentUserAction) {
				await currentUserAction.destroy()
				activeEvent.actions = activeEvent.actions.filter((userAction: any) => userAction.id !== currentUserAction.id)
				await pubsub.publish(groupExerciseEvents.groupExerciseUpdated, { updatedGroupExercise: activeExercise, code, action: 'cancelAction' })
			}

			// Return the exercise as result.
			return activeExercise
		},

		resolveGroupEvent: async (_source, { code, skillId }, { db, pubsub, ensureLoggedIn, userId }) => {
			// Load and verify data.
			ensureLoggedIn()
			const group = await getGroupWithActiveSkillExercise(code, skillId, db)
			verifyGroupAccess(group, userId)
			const activeExercise = group.exercises[0]
			if (!activeExercise) throw new UserInputError(`Could not resolve group event. The group ${group.code} does not have an active exercise.`)
			const activeEvent = activeExercise.events.find((event: any) => event.state === null)
			if (!activeEvent) throw new UserInputError(`Could not resolve group event. The group ${group.code} does not have an active event.`)

			// Check whether the event can be resolved. This requires at least two active members and an action from every active member.
			const activeMembers = group.members.filter((member: any) => member.groupMembership.active)
			if (activeMembers.length < 2) throw new UserInputError(`Could not resolve group event. The group ${group.code} does not have sufficient users present.`)
			if (activeMembers.some((member: any) => !activeEvent.actions.some((userAction: any) => userAction.userId === member.id))) throw new UserInputError(`Could not resolve group event. Not every active user in group ${group.code} has submitted an action.`)

			// Set up an updateSkills handler that only collects calls.
			const skillUpdates: any[] = []
			const updateSkills = (setup: any, correct: boolean, givenUserId?: string) => {
				if (setup) skillUpdates.push({ setup, correct, userId: givenUserId || userId })
			}

			// Check the exercise, getting an updated state. Store this and prepare for a new event.
			const previousState = getGroupExerciseState(activeExercise)
			const exercise = getExercise(skillId, activeExercise.exerciseId)
			if (!exercise) throw new Error(`Invalid exercise: could not load the exercise at skill "${skillId}" with exerciseId "${activeExercise.exerciseId}".`)
			if (!exercise.processGroupActions) throw new Error(`Unsupported exercise mode: exercise "${activeExercise.exerciseId}" does not support group actions.`)
			const state = exercise.processGroupActions({ parameters: activeExercise.parameters, state: previousState, actions: activeEvent.actions, updateSkills })
			if (!state) throw new Error(`Invalid state object: could not process action for skill "${skillId}" exerciseId "${activeExercise.exerciseId}" due to an error in updating the exercise state.`)

			// Time to store things in the database.
			let updatedSkillsPerUser: Record<string, any[]> = {}
			await db.transaction(async (transaction: any) => {
				// Apply all the skill updates that were collected so far.
				updatedSkillsPerUser = await applySkillUpdates(db, skillUpdates, transaction)

				// Store the state in the active event. If the exercise is done, note this. If not, prepare for future actions.
				await activeEvent.update({ state }, { transaction })
				activeEvent.state = state
				if (state.done) {
					await activeExercise.update({ active: false }, { transaction })
					activeExercise.active = false
				} else {
					const newActiveEvent = await activeExercise.createEvent({ state: null }, { transaction })
					newActiveEvent.actions = []
					activeExercise.events = [...activeExercise.events, newActiveEvent]
				}
			})

			// Resolve subscriptions where needed.
			await Promise.all(Object.keys(updatedSkillsPerUser).map(async userId => await pubsub.publish(skillEvents.skillsUpdated, { updatedSkills: updatedSkillsPerUser[userId], userId })))
			await pubsub.publish(groupExerciseEvents.groupExerciseUpdated, { updatedGroupExercise: activeExercise, code, action: 'resolveEvent' })

			// Return the exercise as a result.
			return activeExercise
		},
	},

	Subscription: {
		...getSubscription('activeGroupExercisesUpdate', [groupExerciseEvents.groupExerciseUpdated], ({ updatedGroupExercise, code: codeOfEvent }: any, { code: codeOfFollowedGroup }: any) => {
			// Only pass on when the code matches.
			if (codeOfEvent === codeOfFollowedGroup) return updatedGroupExercise
		}),
	},
}
