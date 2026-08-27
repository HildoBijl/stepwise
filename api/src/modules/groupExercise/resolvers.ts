import { Op, UniqueConstraintError } from 'sequelize'

import { findOptimum } from '@step-wise/js-utils'
import { type UpdateSkills, ensureExerciseAction, isStateDone } from '@step-wise/exercise-definition'
import { generateRandomExerciseInstance } from '@step-wise/exercise-selection'
import { getExercises, getExercise } from '@step-wise/exercises'

import { UserInputError } from '../../errors.ts'

import { getSubscription } from '../subscriptions.ts'
import type { AuthenticatedContext } from '../user/index.ts'
import { groupEvents, getGroup, verifyGroupAccess, verifyGroupMembership } from '../group/index.ts'
import { type UserSkillRecord, type UserSkillUpdate, applySkillUpdates, skillEvents } from '../skill/index.ts'

import { type GroupExerciseActionRecord, type GroupExerciseEventRecord, type GroupExerciseEventWithActions, type GroupExerciseSampleRecord, type GroupExerciseSampleWithEvents, hasLoadedGroupExerciseActions, hasLoadedGroupExerciseEvents } from './models.ts'
import { type GroupExerciseUpdatedPayload, groupExerciseEvents, getGroupExerciseState, getGroupWithAllExercises, getGroupWithActiveExercises, getGroupWithActiveSkillExercise } from './service.ts'

type GroupExerciseContext = Pick<AuthenticatedContext, 'db' | 'ensureLoggedIn' | 'pubsub' | 'userId'>

function getGroupEventPerformedAt(event: GroupExerciseEventWithActions): Date {
	return findOptimum(event.actions.map(userAction => userAction.updatedAt), (a, b) => a.getTime() > b.getTime()) ?? event.updatedAt
}

export const groupExerciseResolvers = {
	GroupExercise: {
		mode: () => 'group',
		startedOn: (exercise: GroupExerciseSampleRecord) => exercise.createdAt,
		state: (exercise: GroupExerciseSampleRecord) => getGroupExerciseState(exercise),
		history: (exercise: GroupExerciseSampleRecord) => [...(exercise.events ?? [])].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()), // Sort the history ascending by date.
	},

	GroupEvent: {
		__resolveType: (event: GroupExerciseEventRecord) => event.state === null ? 'PendingGroupEvent' : 'ResolvedGroupEvent',
	},

	ResolvedGroupEvent: {
		performedAt: getGroupEventPerformedAt,
	},

	PendingGroupEvent: {
		performedAt: getGroupEventPerformedAt,
	},

	GroupExerciseAction: {
		performedAt: (userAction: GroupExerciseActionRecord) => userAction.updatedAt,
	},

	Query: {
		activeGroupExercises: async (_source: unknown, { code }: { code: string }, { db, ensureLoggedIn, userId }: GroupExerciseContext) => {
			ensureLoggedIn()
			const group = await getGroupWithActiveExercises(code, db)
			verifyGroupAccess(group, userId)
			return group.exercises
		},
	},

	Mutation: {
		leaveGroup: async (_source: unknown, { code }: { code: string }, { db, pubsub, ensureLoggedIn, userId }: GroupExerciseContext) => {
			// Load the group and check how many users are left.
			ensureLoggedIn()
			const group = await getGroup(db, code, true)
			verifyGroupMembership(group, userId)
			group.members = group.members.filter(member => member.id !== userId)

			// When the group is left empty, remove it entirely. Otherwise remove all traces from the user.
			if (group.members.length === 0) {
				await group.destroy()
				await pubsub.publish(groupEvents.groupUpdated, { updatedGroup: group, userId, action: 'destroy' })
			} else {
				// Get all user action IDs that have to be removed.
				const groupWithExercises = await getGroupWithAllExercises(code, db)
				if (!groupWithExercises) throw new Error(`Failed to reload group "${code}" with exercises.`)
				const exerciseList: GroupExerciseSampleWithEvents[] = []
				const userActionIdList: string[] = []
				groupWithExercises.exercises.forEach(exercise => {
					// If the user never did anything in this exercise, ignore it.
					if (!exercise.events.some(event => event.actions.some(userAction => userAction.userId === userId))) return

					// Remember the exercise and all actions that the user did in it.
					exerciseList.push(exercise)
					exercise.events.forEach(event => {
						event.actions.forEach(userAction => {
							if (userAction.userId === userId) userActionIdList.push(userAction.id)
						})
						event.actions = event.actions.filter(userAction => userAction.userId !== userId)
					})
				})

				// Remove the user and all its actions. (Including the userId is technically not needed, but still wise for security reasons.)
				await group.removeMember(userId)
				await db.GroupExerciseAction.destroy({ where: { userId, id: { [Op.in]: userActionIdList } } })

				// Publish events about each of the active exercises and on the updated group.
				const activeExercises = exerciseList.filter(exercise => exercise.active)
				await Promise.all(activeExercises.map(async exercise => await pubsub.publish(groupExerciseEvents.groupExerciseUpdated, { updatedGroupExercise: exercise, code, action: 'resolveEvent' })))
				await pubsub.publish(groupEvents.groupUpdated, { updatedGroup: group, userId, action: 'leave' })
			}

			return true
		},

		startGroupExercise: async (_source: unknown, { code, skillId }: { code: string; skillId: string }, { db, pubsub, ensureLoggedIn, userId }: GroupExerciseContext) => {
			// Verify that the user is a member of the given group.
			ensureLoggedIn()
			const group = await getGroupWithActiveSkillExercise(code, skillId, db)
			verifyGroupAccess(group, userId)

			// If an active group exercise already exists, return this. (So if two users start an exercise at the same time, this prevents an error.)
			if (group.exercises.length > 0) return group.exercises[0]

			// Select a new exercise, store it, and right away add an empty event to couple actions to.
			const skillExercises = getExercises(skillId)
			if (!skillExercises) throw new UserInputError(`Cannot start group exercise: no exercises exist for skill "${skillId}".`)
			const newExercise = generateRandomExerciseInstance(skillExercises, 'group')
			let loadedExercise: GroupExerciseSampleWithEvents
			try {
				loadedExercise = await db.transaction(async transaction => {
					const exercise = await db.GroupExerciseSample.create({ groupId: group.id, skillId, exerciseId: newExercise.exerciseId, parameters: newExercise.parameters, initialState: newExercise.initialState, active: true }, { transaction })
					const activeEvent = await db.GroupExerciseEvent.create({ groupExerciseSampleId: exercise.id, state: null }, { transaction })
					activeEvent.actions = []
					if (!hasLoadedGroupExerciseActions(activeEvent)) throw new Error('Failed to initialize group exercise event actions.')
					exercise.events = [activeEvent]
					if (!hasLoadedGroupExerciseEvents(exercise)) throw new Error('Failed to initialize group exercise events.')
					return exercise
				})
			} catch (error) {
				if (!(error instanceof UniqueConstraintError)) throw error
				const updatedGroup = await getGroupWithActiveSkillExercise(code, skillId, db)
				verifyGroupAccess(updatedGroup, userId)
				const existingExercise = updatedGroup.exercises[0]
				if (!existingExercise) throw error
				return existingExercise
			}

			// Return the exercise as result.
			await pubsub.publish(groupExerciseEvents.groupExerciseUpdated, { updatedGroupExercise: loadedExercise, code, action: 'startExercise' })
			return loadedExercise
		},

		submitGroupAction: async (_source: unknown, { code, skillId, action: rawAction }: { code: string; skillId: string; action: unknown }, { db, pubsub, ensureLoggedIn, userId }: GroupExerciseContext) => {
			// Load and verify data.
			ensureLoggedIn()
			const action = ensureExerciseAction(rawAction)
			const group = await getGroupWithActiveSkillExercise(code, skillId, db)
			verifyGroupAccess(group, userId)
			const activeExercise = group.exercises[0]
			if (!activeExercise) throw new UserInputError(`Could not submit group action. The group ${group.code} does not have an active exercise.`)

			// If there is no active event (should never happen) then add one.
			let activeEvent = activeExercise.events.find(event => event.state === null)
			if (!activeEvent) {
				const newActiveEvent = await activeExercise.createEvent({ state: null })
				newActiveEvent.actions = []
				if (!hasLoadedGroupExerciseActions(newActiveEvent)) throw new Error('Failed to initialize group exercise event actions.')
				activeEvent = newActiveEvent
				activeExercise.events = [newActiveEvent]
			}

			// If there is already an action for the user, overwrite it. Otherwise add it.
			const currentUserAction = activeEvent.actions.find(userAction => userAction.userId === userId)
			if (currentUserAction) {
				const newUserAction = await currentUserAction.update({ action })
				activeEvent.actions = activeEvent.actions.map(userAction => userAction.id === newUserAction.id ? newUserAction : userAction)
			} else {
				const newUserAction = await activeEvent.createAction({ userId, action })
				activeEvent.actions = [...activeEvent.actions, newUserAction]
			}

			// Return the exercise as result.
			await pubsub.publish(groupExerciseEvents.groupExerciseUpdated, { updatedGroupExercise: activeExercise, code, action: 'submitAction' })
			return activeExercise
		},

		cancelGroupAction: async (_source: unknown, { code, skillId }: { code: string; skillId: string }, { db, pubsub, ensureLoggedIn, userId }: GroupExerciseContext) => {
			// Load and verify data.
			ensureLoggedIn()
			const group = await getGroupWithActiveSkillExercise(code, skillId, db)
			verifyGroupAccess(group, userId)
			const activeExercise = group.exercises[0]
			if (!activeExercise) throw new UserInputError(`Could not cancel group action. The group ${group.code} does not have an active exercise.`)
			const activeEvent = activeExercise.events.find(event => event.state === null)
			if (!activeEvent) throw new UserInputError(`Could not cancel group action. The group ${group.code} does not have an active event.`)

			// Load the user's action and delete it if it exists.
			const currentUserAction = activeEvent.actions.find(userAction => userAction.userId === userId)
			if (currentUserAction) {
				await currentUserAction.destroy()
				activeEvent.actions = activeEvent.actions.filter(userAction => userAction.id !== currentUserAction.id)
				await pubsub.publish(groupExerciseEvents.groupExerciseUpdated, { updatedGroupExercise: activeExercise, code, action: 'cancelAction' })
			}

			// Return the exercise as result.
			return activeExercise
		},

		resolveGroupEvent: async (_source: unknown, { code, skillId }: { code: string; skillId: string }, { db, pubsub, ensureLoggedIn, userId }: GroupExerciseContext) => {
			// Load and verify data.
			ensureLoggedIn()
			const group = await getGroupWithActiveSkillExercise(code, skillId, db)
			verifyGroupAccess(group, userId)
			const activeExercise = group.exercises[0]
			if (!activeExercise) throw new UserInputError(`Could not resolve group event. The group ${group.code} does not have an active exercise.`)
			const activeEvent = activeExercise.events.find(event => event.state === null)
			if (!activeEvent) throw new UserInputError(`Could not resolve group event. The group ${group.code} does not have an active event.`)

			// Check whether the event can be resolved. This requires at least two active members and an action from every active member.
			const activeMembers = group.members.filter(member => member.groupMembership.active)
			if (activeMembers.length < 2) throw new UserInputError(`Could not resolve group event. The group ${group.code} does not have sufficient users present.`)
			if (activeMembers.some(member => !activeEvent.actions.some(userAction => userAction.userId === member.id))) throw new UserInputError(`Could not resolve group event. Not every active user in group ${group.code} has submitted an action.`)

			// Set up an updateSkills handler that only collects calls.
			const skillUpdates: UserSkillUpdate[] = []
			const updateSkills: UpdateSkills = (setup, correct, givenUserId) => {
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
			let updatedSkillsPerUser: Record<string, UserSkillRecord[]> = {}
			await db.transaction(async transaction => {
				// Apply all the skill updates that were collected so far.
				updatedSkillsPerUser = await applySkillUpdates(db, skillUpdates, transaction)

				// Store the state in the active event. If the exercise is done, note this. If not, prepare for future actions.
				await activeEvent.update({ state }, { transaction })
				activeEvent.state = state
				if (isStateDone(state)) {
					await activeExercise.update({ active: false }, { transaction })
					activeExercise.active = false
				} else {
					const newActiveEvent = await activeExercise.createEvent({ state: null }, { transaction })
					newActiveEvent.actions = []
					if (!hasLoadedGroupExerciseActions(newActiveEvent)) throw new Error('Failed to initialize group exercise event actions.')
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
		...getSubscription('activeGroupExercisesUpdate', [groupExerciseEvents.groupExerciseUpdated], ({ updatedGroupExercise, code: codeOfEvent }: GroupExerciseUpdatedPayload, { code: codeOfFollowedGroup }: { code: string }) => {
			// Only pass on when the code matches.
			if (codeOfEvent === codeOfFollowedGroup.toUpperCase()) return updatedGroupExercise
		}, async ({ code }: { code: string }, { db, ensureLoggedIn, userId }: GroupExerciseContext) => {
			ensureLoggedIn()
			verifyGroupAccess(await getGroupWithActiveExercises(code, db), userId)
		}),
	},
}
