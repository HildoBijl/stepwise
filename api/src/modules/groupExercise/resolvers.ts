import { type Transaction, Op, UniqueConstraintError } from 'sequelize'

import { findOptimum } from '@step-wise/js-utils'
import { type UpdateSkills, ensureExerciseAction, isStateDone } from '@step-wise/exercise-definition'
import { generateRandomExerciseInstance } from '@step-wise/exercise-selection'
import { getExercises, getExercise } from '@step-wise/exercises'

import { InvalidInputError } from '../../errors.ts'

import { createSubscriptionResolver } from '../subscriptions.ts'
import type { AuthenticatedContext } from '../user/index.ts'
import { ensureActiveGroupMembership, ensureGroupMembership, getGroup, groupEvents, hasLoadedGroupMembers } from '../group/index.ts'
import { type UserSkillObservationInput, type UserSkillRecord, applySkillObservations, skillEvents } from '../skill/index.ts'

import { type GroupExerciseActionRecord, type GroupExerciseEventRecord, type GroupExerciseEventWithActions, type GroupExerciseSampleRecord, type GroupExerciseSampleWithEvents, hasLoadedGroupExerciseActions, hasLoadedGroupExerciseEvents } from './models.ts'
import { type GroupExerciseDatabase, type GroupExerciseUpdatedPayload, getCurrentGroupExerciseState, getGroupWithActiveExercises, getGroupWithActiveSkillExercise, getGroupWithAllExercises, groupExerciseEvents } from './service.ts'

type GroupExerciseContext = Pick<AuthenticatedContext, 'db' | 'ensureLoggedIn' | 'pubsub' | 'userId'>

function getGroupEventPerformedAt(event: GroupExerciseEventWithActions): Date {
	return findOptimum(event.actions.map(userAction => userAction.updatedAt), (a, b) => a.getTime() > b.getTime()) ?? event.updatedAt
}

async function lockPendingGroupEvent(db: GroupExerciseDatabase, eventId: string, groupCode: string, transaction: Transaction): Promise<GroupExerciseEventWithActions> {
	const event = await db.GroupExerciseEvent.findByPk(eventId, { transaction, lock: transaction.LOCK.UPDATE })
	if (!event || event.state !== null) throw new InvalidInputError(`Could not update group event. The active event for group ${groupCode} has already been resolved.`)
	event.actions = await db.GroupExerciseAction.findAll({ where: { groupExerciseEventId: event.id }, transaction })
	if (!hasLoadedGroupExerciseActions(event)) throw new Error(`Failed to load actions for group exercise event "${event.id}".`)
	return event
}

export const groupExerciseResolvers = {
	GroupExercise: {
		mode: () => 'group',
		startedAt: (exercise: GroupExerciseSampleRecord) => exercise.createdAt,
		state: (exercise: GroupExerciseSampleRecord) => getCurrentGroupExerciseState(exercise),
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
			const group = await getGroupWithActiveExercises(db, code)
			ensureActiveGroupMembership(group, userId)
			return group.exercises
		},
	},

	Mutation: {
		leaveGroup: async (_source: unknown, { code }: { code: string }, { db, pubsub, ensureLoggedIn, userId }: GroupExerciseContext) => {
			ensureLoggedIn()
			const result = await db.transaction(async transaction => {
				// Lock the group so concurrent leave operations cannot both make decisions from the same member list.
				const group = await getGroup(db, code, { transaction, lock: transaction.LOCK.UPDATE })
				group.members = await group.getMembers({ transaction })
				if (!hasLoadedGroupMembers(group)) throw new Error(`Failed to load members of group "${group.code}".`)
				ensureGroupMembership(group, userId)
				group.members = group.members.filter(member => member.id !== userId)

				// When the group is left empty, remove it entirely through cascading deletes.
				if (group.members.length === 0) {
					await group.destroy({ transaction })
					return { group, activeExercises: [], action: 'destroy' as const }
				}

				const groupWithExercises = await getGroupWithAllExercises(db, group.code, { transaction })
				if (!groupWithExercises) throw new Error(`Failed to reload group "${group.code}" with exercises.`)
				const eventIds = groupWithExercises.exercises.flatMap(exercise => exercise.events.map(event => event.id)).sort()
				if (eventIds.length > 0) await db.GroupExerciseEvent.findAll({ where: { id: { [Op.in]: eventIds } }, order: [['id', 'ASC']], transaction, lock: transaction.LOCK.UPDATE })

				// Reload actions after acquiring the event locks, then remove the user's actions and membership atomically.
				const userActions = await db.GroupExerciseAction.findAll({ where: { userId, groupExerciseEventId: { [Op.in]: eventIds } }, transaction })
				const userActionIds = new Set(userActions.map(action => action.id))
				const affectedEventIds = new Set(userActions.map(action => action.groupExerciseEventId))
				const affectedExercises = groupWithExercises.exercises.filter(exercise => exercise.events.some(event => affectedEventIds.has(event.id)))
				affectedExercises.forEach(exercise => exercise.events.forEach(event => { event.actions = event.actions.filter(action => !userActionIds.has(action.id)) }))
				await group.removeMember(userId, { transaction })
				await db.GroupExerciseAction.destroy({ where: { userId, id: { [Op.in]: [...userActionIds] } }, transaction })

				return { group, activeExercises: affectedExercises.filter(exercise => exercise.active), action: 'leave' as const }
			})

			await Promise.all(result.activeExercises.map(async exercise => await pubsub.publish(groupExerciseEvents.groupExerciseUpdated, { updatedGroupExercise: exercise, code: result.group.code, action: 'resolveEvent' })))
			await pubsub.publish(groupEvents.groupUpdated, { updatedGroup: result.group, userId, action: result.action })

			return true
		},

		startGroupExercise: async (_source: unknown, { code, skillId }: { code: string; skillId: string }, { db, pubsub, ensureLoggedIn, userId }: GroupExerciseContext) => {
			// Verify that the user is a member of the given group.
			ensureLoggedIn()
			const group = await getGroupWithActiveSkillExercise(db, code, skillId)
			ensureActiveGroupMembership(group, userId)

			// If an active group exercise already exists, return this. (So if two users start an exercise at the same time, this prevents an error.)
			if (group.exercises.length > 0) return group.exercises[0]

			// Select a new exercise, store it, and right away add an empty event to couple actions to.
			const skillExercises = getExercises(skillId)
			if (!skillExercises) throw new InvalidInputError(`Cannot start group exercise: no exercises exist for skill "${skillId}".`)
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
				const updatedGroup = await getGroupWithActiveSkillExercise(db, code, skillId)
				ensureActiveGroupMembership(updatedGroup, userId)
				const existingExercise = updatedGroup.exercises[0]
				if (!existingExercise) throw error
				return existingExercise
			}

			// Return the exercise as result.
			await pubsub.publish(groupExerciseEvents.groupExerciseUpdated, { updatedGroupExercise: loadedExercise, code: group.code, action: 'startExercise' })
			return loadedExercise
		},

		submitGroupAction: async (_source: unknown, { code, skillId, action: rawAction }: { code: string; skillId: string; action: unknown }, { db, pubsub, ensureLoggedIn, userId }: GroupExerciseContext) => {
			// Load and verify data.
			ensureLoggedIn()
			const action = ensureExerciseAction(rawAction)
			const group = await getGroupWithActiveSkillExercise(db, code, skillId)
			ensureActiveGroupMembership(group, userId)
			const activeExercise = group.exercises[0]
			if (!activeExercise) throw new InvalidInputError(`Could not submit group action. The group ${group.code} does not have an active exercise.`)

			const activeEvent = activeExercise.events.find(event => event.state === null)
			if (!activeEvent) throw new InvalidInputError(`Could not submit group action. The group ${group.code} does not have an active event.`)

			await db.transaction(async transaction => {
				const lockedEvent = await lockPendingGroupEvent(db, activeEvent.id, group.code, transaction)
				const currentUserAction = lockedEvent.actions.find(userAction => userAction.userId === userId)
				if (currentUserAction) {
					const newUserAction = await currentUserAction.update({ action }, { transaction })
					lockedEvent.actions = lockedEvent.actions.map(userAction => userAction.id === newUserAction.id ? newUserAction : userAction)
				} else {
					const newUserAction = await lockedEvent.createAction({ userId, action }, { transaction })
					lockedEvent.actions = [...lockedEvent.actions, newUserAction]
				}
				activeExercise.events = activeExercise.events.map(event => event.id === lockedEvent.id ? lockedEvent : event)
			})

			// Return the exercise as result.
			await pubsub.publish(groupExerciseEvents.groupExerciseUpdated, { updatedGroupExercise: activeExercise, code: group.code, action: 'submitAction' })
			return activeExercise
		},

		cancelGroupAction: async (_source: unknown, { code, skillId }: { code: string; skillId: string }, { db, pubsub, ensureLoggedIn, userId }: GroupExerciseContext) => {
			// Load and verify data.
			ensureLoggedIn()
			const group = await getGroupWithActiveSkillExercise(db, code, skillId)
			ensureActiveGroupMembership(group, userId)
			const activeExercise = group.exercises[0]
			if (!activeExercise) throw new InvalidInputError(`Could not cancel group action. The group ${group.code} does not have an active exercise.`)
			const activeEvent = activeExercise.events.find(event => event.state === null)
			if (!activeEvent) throw new InvalidInputError(`Could not cancel group action. The group ${group.code} does not have an active event.`)

			// Lock the pending event before deleting an action, so resolution cannot process stale actions.
			const actionWasCanceled = await db.transaction(async transaction => {
				const lockedEvent = await lockPendingGroupEvent(db, activeEvent.id, group.code, transaction)
				const currentUserAction = lockedEvent.actions.find(userAction => userAction.userId === userId)
				if (!currentUserAction) return false
				await currentUserAction.destroy({ transaction })
				lockedEvent.actions = lockedEvent.actions.filter(userAction => userAction.id !== currentUserAction.id)
				activeExercise.events = activeExercise.events.map(event => event.id === lockedEvent.id ? lockedEvent : event)
				return true
			})
			if (actionWasCanceled) {
				await pubsub.publish(groupExerciseEvents.groupExerciseUpdated, { updatedGroupExercise: activeExercise, code: group.code, action: 'cancelAction' })
			}

			// Return the exercise as result.
			return activeExercise
		},

		resolveGroupEvent: async (_source: unknown, { code, skillId }: { code: string; skillId: string }, { db, pubsub, ensureLoggedIn, userId }: GroupExerciseContext) => {
			// Load and verify data.
			ensureLoggedIn()
			const group = await getGroupWithActiveSkillExercise(db, code, skillId)
			ensureActiveGroupMembership(group, userId)
			const activeExercise = group.exercises[0]
			if (!activeExercise) throw new InvalidInputError(`Could not resolve group event. The group ${group.code} does not have an active exercise.`)
			const activeEvent = activeExercise.events.find(event => event.state === null)
			if (!activeEvent) throw new InvalidInputError(`Could not resolve group event. The group ${group.code} does not have an active event.`)

			const exercise = getExercise(skillId, activeExercise.exerciseId)
			if (!exercise) throw new Error(`Invalid exercise: could not load the exercise at skill "${skillId}" with exerciseId "${activeExercise.exerciseId}".`)
			if (!exercise.processGroupActions) throw new Error(`Unsupported exercise mode: exercise "${activeExercise.exerciseId}" does not support group actions.`)
			const processGroupActions = exercise.processGroupActions

			// Try to process things in the database. Lock the event to prevent concurrent changes.
			let updatedSkillsPerUser: Record<string, UserSkillRecord[]> = {}
			await db.transaction(async transaction => {
				const lockedEvent = await lockPendingGroupEvent(db, activeEvent.id, group.code, transaction)
				activeExercise.events = activeExercise.events.map(event => event.id === lockedEvent.id ? lockedEvent : event)

				// Resolution requires at least two active members and an action from every active member.
				const activeMembers = group.members.filter(member => member.groupMembership.active)
				if (activeMembers.length < 2) throw new InvalidInputError(`Could not resolve group event. The group ${group.code} does not have sufficient users present.`)
				if (activeMembers.some(member => !lockedEvent.actions.some(userAction => userAction.userId === member.id))) throw new InvalidInputError(`Could not resolve group event. Not every active user in group ${group.code} has submitted an action.`)

				const skillObservations: UserSkillObservationInput[] = []
				const updateSkills: UpdateSkills = (setup, correct, givenUserId) => {
					if (setup) skillObservations.push({ setup, correct, userId: givenUserId || userId })
				}
				const previousState = getCurrentGroupExerciseState(activeExercise)
				const state = processGroupActions({ parameters: activeExercise.parameters, state: previousState, actions: lockedEvent.actions, updateSkills })
				if (!state) throw new Error(`Invalid state object: could not process action for skill "${skillId}" exerciseId "${activeExercise.exerciseId}" due to an error in updating the exercise state.`)
				await lockedEvent.update({ state }, { transaction })
				lockedEvent.state = state

				// Apply all the skill updates that were collected so far.
				updatedSkillsPerUser = await applySkillObservations(db, skillObservations, transaction)

				// If the exercise is done, note this. If not, prepare for future actions.
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
			await pubsub.publish(groupExerciseEvents.groupExerciseUpdated, { updatedGroupExercise: activeExercise, code: group.code, action: 'resolveEvent' })

			// Return the exercise as a result.
			return activeExercise
		},
	},

	Subscription: {
		...createSubscriptionResolver('activeGroupExercisesUpdated', [groupExerciseEvents.groupExerciseUpdated], ({ updatedGroupExercise, code: codeOfEvent }: GroupExerciseUpdatedPayload, { code: codeOfFollowedGroup }: { code: string }) => {
			// Only pass on when the code matches.
			if (codeOfEvent === codeOfFollowedGroup.toUpperCase()) return updatedGroupExercise
		}, async ({ code }: { code: string }, { db, ensureLoggedIn, userId }: GroupExerciseContext) => {
			ensureLoggedIn()
			ensureActiveGroupMembership(await getGroupWithActiveExercises(db, code), userId)
		}),
	},
}
