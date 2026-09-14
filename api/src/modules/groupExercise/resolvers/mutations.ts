import { type Transaction, UniqueConstraintError } from 'sequelize'

import { type UpdateSkills, ensureExerciseAction, isStateDone } from '@step-wise/exercise-definition'
import { generateRandomExerciseInstance } from '@step-wise/exercise-selection'
import { getExercise, getExercises } from '@step-wise/exercises'

import { InvalidInputError } from '../../../errors.ts'

import { type GroupWithMembers, ensureActiveGroupMembership, hasLoadedGroupMembers } from '../../group/index.ts'
import { type UserSkillObservationInput, type UserSkillRecord, applySkillObservations, skillEvents } from '../../skill/index.ts'

import { type GroupExerciseEventWithActions, type GroupExerciseSampleWithEvents, hasLoadedGroupExerciseActions, hasLoadedGroupExerciseEvents } from '../models.ts'
import { type GroupEventResolvedPayload, type GroupExerciseDatabase, getCurrentGroupExerciseState, getGroupExerciseById, getGroupWithActiveSkillExercise, groupExerciseEvents } from '../service.ts'
import type { GroupExerciseContext } from './types.ts'

export const groupExerciseMutationResolvers = {
	startGroupExercise: async (_source: unknown, { code, skillId }: { code: string; skillId: string }, { db, pubsub, ensureSignedIn, userId }: GroupExerciseContext) => {
		// Verify that the user is a member of the given group.
		ensureSignedIn()
		const group = await getGroupWithActiveSkillExercise(db, code, skillId)
		ensureActiveGroupMembership(group, userId)

		// If an active group exercise already exists, return this. (So if two users start an exercise at the same time, this prevents an error.)
		if (group.exercises.length > 0) return group.exercises[0]

		// Select a new exercise, store it, and right away add an empty event to couple actions to.
		const skillExercises = getExercises(skillId)
		if (!skillExercises) throw new InvalidInputError(`Cannot start group exercise: no exercises exist for skill "${skillId}".`)
		const newExercise = await generateRandomExerciseInstance(skillExercises, 'group')
		let loadedExercise: GroupExerciseSampleWithEvents
		try {
			loadedExercise = await db.transaction(async transaction => {
				const exercise = await db.GroupExerciseSample.create({ groupId: group.id, skillId, exerciseId: newExercise.exerciseId, parameters: newExercise.parameters, initialState: newExercise.initialState, active: true }, { transaction })
				const activeEvent = await db.GroupExerciseEvent.create({ groupExerciseSampleId: exercise.id, eventIndex: 0, state: null }, { transaction })
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
		await pubsub.publish(groupExerciseEvents.groupExerciseStarted, { exercise: loadedExercise, code: group.code, memberIds: group.members.map(member => member.id) })
		return loadedExercise
	},

	submitGroupAction: async (_source: unknown, { exerciseId, eventIndex, action: rawAction }: { exerciseId: string; eventIndex: number; action: unknown }, { db, pubsub, ensureSignedIn, userId }: GroupExerciseContext) => {
		// Load and verify data.
		ensureSignedIn()
		const action = ensureExerciseAction(rawAction)
		const { exercise: activeExercise, group } = await getActiveGroupExercise(db, exerciseId, userId)

		const activeEvent = activeExercise.events.find(event => event.state === null)
		if (!activeEvent) throw new InvalidInputError(`Could not submit group action. The group ${group.code} does not have an active event.`)

		const { updatedAction, lockedEvent } = await db.transaction(async transaction => {
			const lockedEvent = await lockPendingGroupEvent(db, activeEvent.id, group.code, transaction)
			if (eventIndex !== lockedEvent.eventIndex) throw new InvalidInputError(`Cannot submit group action: exercise event index ${eventIndex} is stale; the current index is ${lockedEvent.eventIndex}.`)
			const currentUserAction = lockedEvent.actions.find(userAction => userAction.userId === userId)
			if (currentUserAction) {
				const newUserAction = await currentUserAction.update({ action }, { transaction })
				lockedEvent.actions = lockedEvent.actions.map(userAction => userAction.id === newUserAction.id ? newUserAction : userAction)
				return { updatedAction: newUserAction, lockedEvent }
			} else {
				const newUserAction = await lockedEvent.createAction({ userId, action }, { transaction })
				lockedEvent.actions = [...lockedEvent.actions, newUserAction]
				return { updatedAction: newUserAction, lockedEvent }
			}
		})
		activeExercise.events = activeExercise.events.map(event => event.id === lockedEvent.id ? lockedEvent : event)

		// Return the exercise as result.
		await pubsub.publish(groupExerciseEvents.groupActionUpdated, { exerciseId, eventIndex, userId, action: updatedAction, memberIds: group.members.map(member => member.id) })
		return activeExercise
	},

	cancelGroupAction: async (_source: unknown, { exerciseId, eventIndex }: { exerciseId: string; eventIndex: number }, { db, pubsub, ensureSignedIn, userId }: GroupExerciseContext) => {
		// Load and verify data.
		ensureSignedIn()
		const { exercise: activeExercise, group } = await getActiveGroupExercise(db, exerciseId, userId)
		const activeEvent = activeExercise.events.find(event => event.state === null)
		if (!activeEvent) throw new InvalidInputError(`Could not cancel group action. The group ${group.code} does not have an active event.`)

		// Lock the pending event before deleting an action, so resolution cannot process stale actions.
		const actionWasCanceled = await db.transaction(async transaction => {
			const lockedEvent = await lockPendingGroupEvent(db, activeEvent.id, group.code, transaction)
			if (eventIndex !== lockedEvent.eventIndex) throw new InvalidInputError(`Cannot cancel group action: exercise event index ${eventIndex} is stale; the current index is ${lockedEvent.eventIndex}.`)
			const currentUserAction = lockedEvent.actions.find(userAction => userAction.userId === userId)
			if (!currentUserAction) return false
			await currentUserAction.destroy({ transaction })
			lockedEvent.actions = lockedEvent.actions.filter(userAction => userAction.id !== currentUserAction.id)
			activeExercise.events = activeExercise.events.map(event => event.id === lockedEvent.id ? lockedEvent : event)
			return true
		})
		if (actionWasCanceled) {
			await pubsub.publish(groupExerciseEvents.groupActionUpdated, { exerciseId, eventIndex, userId, action: null, memberIds: group.members.map(member => member.id) })
		}

		// Return the exercise as result.
		return activeExercise
	},

	resolveGroupEvent: async (_source: unknown, { exerciseId, eventIndex }: { exerciseId: string; eventIndex: number }, { db, pubsub, ensureSignedIn, userId }: GroupExerciseContext) => {
		// Load and verify data.
		ensureSignedIn()
		const { exercise: activeExercise, group } = await getActiveGroupExercise(db, exerciseId, userId)
		const activeEvent = activeExercise.events.find(event => event.state === null)
		if (!activeEvent) throw new InvalidInputError(`Could not resolve group event. The group ${group.code} does not have an active event.`)

		const skillId = activeExercise.skillId
		const exercise = getExercise(skillId, activeExercise.exerciseId)
		if (!exercise) throw new Error(`Invalid exercise: could not load the exercise at skill "${skillId}" with exerciseId "${activeExercise.exerciseId}".`)
		if (!exercise.processGroupActions) throw new Error(`Unsupported exercise mode: exercise "${activeExercise.exerciseId}" does not support group actions.`)
		const processGroupActions = exercise.processGroupActions

		// Try to process things in the database. Lock the event to prevent concurrent changes.
		let updatedSkillsPerUser: Record<string, UserSkillRecord[]> = {}
		let resolution: Omit<GroupEventResolvedPayload, 'exerciseId' | 'memberIds'> | undefined
		await db.transaction(async transaction => {
			const lockedEvent = await lockPendingGroupEvent(db, activeEvent.id, group.code, transaction)
			if (eventIndex !== lockedEvent.eventIndex) throw new InvalidInputError(`Cannot resolve group event: exercise event index ${eventIndex} is stale; the current index is ${lockedEvent.eventIndex}.`)
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
			const actions = lockedEvent.actions.map(({ userId, action }) => {
				if (!userId) throw new Error(`A pending group exercise action cannot have an anonymous author.`)
				return { userId, action }
			})
			const { state, report } = await processGroupActions({ parameters: activeExercise.parameters, state: previousState, actions, updateSkills })
			if (!state) throw new Error(`Invalid state object: could not process action for skill "${skillId}" exerciseId "${activeExercise.exerciseId}" due to an error in updating the exercise state.`)
			await lockedEvent.update({ state, report: report ?? null }, { transaction })
			lockedEvent.state = state
			lockedEvent.report = report ?? null

			// Apply all the skill updates that were collected so far.
			updatedSkillsPerUser = await applySkillObservations(db, skillObservations, transaction)

			// If the exercise is done, note this. If not, prepare for future actions.
			if (isStateDone(state)) {
				await activeExercise.update({ active: false }, { transaction })
				activeExercise.active = false
				resolution = { eventIndex: lockedEvent.eventIndex, state, report: report ?? null, active: false, nextEvent: null }
			} else {
				const newActiveEvent = await activeExercise.createEvent({ eventIndex: lockedEvent.eventIndex + 1, state: null }, { transaction })
				newActiveEvent.actions = []
				if (!hasLoadedGroupExerciseActions(newActiveEvent)) throw new Error('Failed to initialize group exercise event actions.')
				activeExercise.events = [...activeExercise.events, newActiveEvent]
				resolution = { eventIndex: lockedEvent.eventIndex, state, report: report ?? null, active: true, nextEvent: newActiveEvent }
			}
		})
		if (!resolution) throw new Error(`Failed to resolve group exercise event ${eventIndex}.`)

		// Resolve subscriptions where needed.
		await Promise.all(Object.keys(updatedSkillsPerUser).map(async userId => await pubsub.publish(skillEvents.skillsUpdated, { updatedSkills: updatedSkillsPerUser[userId], userId })))
		await pubsub.publish(groupExerciseEvents.groupEventResolved, { exerciseId, ...resolution, memberIds: group.members.map(member => member.id) })

		// Return the exercise as a result.
		return activeExercise
	},
}

async function lockPendingGroupEvent(db: GroupExerciseDatabase, eventId: string, groupCode: string, transaction: Transaction): Promise<GroupExerciseEventWithActions> {
	const event = await db.GroupExerciseEvent.findByPk(eventId, { transaction, lock: transaction.LOCK.UPDATE })
	if (!event || event.state !== null) throw new InvalidInputError(`Could not update group event. The active event for group ${groupCode} has already been resolved.`)
	event.actions = await db.GroupExerciseAction.findAll({ where: { groupExerciseEventId: event.id }, transaction })
	if (!hasLoadedGroupExerciseActions(event)) throw new Error(`Failed to load actions for group exercise event "${event.id}".`)
	return event
}

async function getActiveGroupExercise(db: GroupExerciseDatabase, exerciseId: string, userId: string): Promise<{ exercise: GroupExerciseSampleWithEvents; group: GroupWithMembers }> {
	const exercise = await getGroupExerciseById(db, exerciseId)
	if (!exercise || !exercise.active) throw new InvalidInputError(`Cannot update group exercise: exercise "${exerciseId}" is not active.`)
	const group = await db.Group.findByPk(exercise.groupId, { include: { association: 'members' } })
	if (group && !hasLoadedGroupMembers(group)) throw new Error(`Failed to load members of group "${group.code}".`)
	ensureActiveGroupMembership(group, userId)
	return { exercise, group }
}
