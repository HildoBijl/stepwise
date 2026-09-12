import type { PubSubEngine } from 'graphql-subscriptions'
import { type Transaction, Op } from 'sequelize'

import type { ExerciseState } from '@step-wise/exercise-definition'
import { last } from '@step-wise/js-utils'
import type { SkillId } from '@step-wise/skill-definition'
import { getExercise } from '@step-wise/exercises'

import type { ServiceOptions } from '../types.ts'
import { type GroupDatabase, type GroupWithMembers, hasLoadedGroupMembers } from '../group/index.ts'

import { type GroupExerciseActionModel, type GroupExerciseActionRecord, type GroupExerciseEventModel, type GroupExerciseEventRecord, type GroupExerciseSampleModel, type GroupExerciseSampleRecord, type GroupExerciseSampleWithEvents, type GroupWithLoadedExercises, hasLoadedGroupExerciseEvents, hasLoadedGroupExercises } from './models.ts'

export interface GroupExerciseDatabase extends GroupDatabase {
	GroupExerciseAction: GroupExerciseActionModel
	GroupExerciseEvent: GroupExerciseEventModel
	GroupExerciseSample: GroupExerciseSampleModel
}

export const groupExerciseEvents = {
	groupActionUpdated: 'GROUP_ACTION_UPDATED',
	groupEventResolved: 'GROUP_EVENT_RESOLVED',
	groupExerciseStarted: 'GROUP_EXERCISE_STARTED',
} as const

type GroupExerciseSubscriptionPayload = {
	exerciseId: string
	memberIds: string[]
}

export type GroupExerciseStartedPayload = {
	exercise: GroupExerciseSampleWithEvents
	code: string
	memberIds: string[]
}

export type GroupActionUpdatedPayload = GroupExerciseSubscriptionPayload & {
	eventIndex: number
	userId: string
	action: GroupExerciseActionRecord | null
}

export type GroupEventResolvedPayload = GroupExerciseSubscriptionPayload & {
	eventIndex: number
	state: ExerciseState
	active: boolean
	nextEvent: GroupExerciseEventRecord | null
}

function getLatestResolvedGroupEvent(exercise: GroupExerciseSampleRecord): GroupExerciseEventRecord | null {
	return exercise.events?.findLast(event => event.state !== null) ?? null
}

export function getCurrentGroupExerciseState(exercise: GroupExerciseSampleRecord): ExerciseState {
	return getLatestResolvedGroupEvent(exercise)?.state ?? exercise.initialState
}

export function getGroupExerciseEventIndex(exercise: GroupExerciseSampleRecord): number {
	return exercise.events?.length ? last(exercise.events).eventIndex : 0
}

function sortGroupExerciseEvents(exercise: GroupExerciseSampleWithEvents): GroupExerciseSampleWithEvents {
	exercise.events.sort((a, b) => a.eventIndex - b.eventIndex)
	return exercise
}

function ensureLoadedGroupExerciseEvents(exercise: GroupExerciseSampleRecord | null): GroupExerciseSampleWithEvents | null {
	if (!exercise) return null
	if (!hasLoadedGroupExerciseEvents(exercise)) throw new Error(`Failed to load events and actions for group exercise "${exercise.id}".`)
	return sortGroupExerciseEvents(exercise)
}

export async function getGroupExerciseById(db: GroupExerciseDatabase, id: string, options: ServiceOptions = {}): Promise<GroupExerciseSampleWithEvents | null> {
	const exercise = await db.GroupExerciseSample.findByPk(id, {
		...(options.transaction ? { transaction: options.transaction } : {}),
		include: [{ association: 'events', required: false, include: [{ association: 'actions', required: false }] }],
	})
	return ensureLoadedGroupExerciseEvents(exercise)
}

export async function getLatestGroupExercise(db: GroupExerciseDatabase, groupId: string, skillId: SkillId, options: ServiceOptions = {}): Promise<GroupExerciseSampleWithEvents | null> {
	const exercise = await db.GroupExerciseSample.findOne({
		...(options.transaction ? { transaction: options.transaction } : {}),
		where: { groupId, skillId },
		order: [['createdAt', 'DESC'], ['id', 'DESC']],
		include: [{ association: 'events', required: false, include: [{ association: 'actions', required: false }] }],
	})
	return ensureLoadedGroupExerciseEvents(exercise)
}

async function deactivateUnavailableGroupExercises(group: GroupWithLoadedExercises | null, { transaction }: ServiceOptions = {}): Promise<GroupWithLoadedExercises | null> {
	if (!group) return null
	await Promise.all(group.exercises.filter(exercise => exercise.active && !getExercise(exercise.skillId, exercise.exerciseId)).map(exercise => exercise.update({ active: false }, transaction ? { transaction } : {})))
	return group
}

interface GetGroupWithExercisesOptions extends ServiceOptions {
	where?: Record<string, unknown>
}

async function getGroupWithExercises(db: GroupExerciseDatabase, code: string, { where, transaction }: GetGroupWithExercisesOptions = {}): Promise<GroupWithLoadedExercises | null> {
	const group = await db.Group.findOne({
		...(transaction ? { transaction } : {}),
		where: { code: code.toUpperCase() },
		include: [{ association: 'members' }, {
			association: 'exercises',
			...(where ? { where } : {}),
			required: false,
			include: [{ association: 'events', required: false, include: [{ association: 'actions', required: false }] }],
		}],
	})
	if (!group) return null
	if (!hasLoadedGroupMembers(group)) throw new Error(`Failed to load members of group "${group.code}".`)
	if (!hasLoadedGroupExercises(group)) throw new Error(`Failed to load exercises, events, and actions of group "${group.code}".`)
	group.exercises.forEach(sortGroupExerciseEvents)
	await deactivateUnavailableGroupExercises(group, { ...(transaction ? { transaction } : {}) })
	if (where?.active) group.exercises = group.exercises.filter(exercise => exercise.active)
	return group
}

export function getGroupWithAllExercises(db: GroupExerciseDatabase, code: string, options: ServiceOptions = {}): Promise<GroupWithLoadedExercises | null> {
	return getGroupWithExercises(db, code, options)
}
export function getGroupWithActiveSkillExercise(db: GroupExerciseDatabase, code: string, skillId: SkillId, options: ServiceOptions = {}): Promise<GroupWithLoadedExercises | null> {
	return getGroupWithExercises(db, code, { ...options, where: { skillId, active: true } })
}

interface PendingGroupActionRemoval {
	exerciseId: string
	eventIndex: number
}

async function cleanUpGroupExerciseActionsForLeavingMember(db: GroupExerciseDatabase, group: GroupWithMembers, userId: string, transaction: Transaction): Promise<PendingGroupActionRemoval[]> {
	// Reload all exercises of the group.
	const groupWithExercises = await getGroupWithAllExercises(db, group.code, { transaction })
	if (!groupWithExercises) throw new Error(`Failed to reload group "${group.code}" with exercises.`)
	const eventIds = groupWithExercises.exercises.flatMap(exercise => exercise.events.map(event => event.id)).sort()
	if (eventIds.length === 0) return []

	// Find all events of the group that have actions by the leaving member, and delete those actions.
	await db.GroupExerciseEvent.findAll({ where: { id: { [Op.in]: eventIds } }, order: [['id', 'ASC']], transaction, lock: transaction.LOCK.UPDATE })
	const userActions = await db.GroupExerciseAction.findAll({ where: { userId, groupExerciseEventId: { [Op.in]: eventIds } }, transaction })
	const affectedEventIds = new Set(userActions.map(action => action.groupExerciseEventId))
	if (userActions.length > 0) await db.GroupExerciseAction.destroy({ where: { userId, id: { [Op.in]: userActions.map(action => action.id) } }, transaction })

	// Return the exercise IDs and event indices of the events that were affected by the action deletions, for possible subscriptions.
	return groupWithExercises.exercises.flatMap(exercise => exercise.events
		.filter(event => event.state === null && affectedEventIds.has(event.id))
		.map(event => ({ exerciseId: exercise.id, eventIndex: event.eventIndex })))
}

export async function prepareGroupMemberDeparture(db: GroupExerciseDatabase, group: GroupWithMembers, userId: string, transaction: Transaction, pubsub: PubSubEngine): Promise<() => Promise<void>> {
	const pendingRemovals = await cleanUpGroupExerciseActionsForLeavingMember(db, group, userId, transaction)
	const memberIds = group.members.map(member => member.id)
	return async () => {
		await Promise.all(pendingRemovals.map(async ({ exerciseId, eventIndex }) => {
			await pubsub.publish(groupExerciseEvents.groupActionUpdated, { exerciseId, eventIndex, userId, action: null, memberIds })
		}))
	}
}
