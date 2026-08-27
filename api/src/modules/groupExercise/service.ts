import { findOptimum } from '@step-wise/js-utils'
import type { ExerciseState } from '@step-wise/exercise-definition'
import type { SkillId } from '@step-wise/skill-definition'
import { getExercise } from '@step-wise/exercises'

import type { ServiceOptions } from '../types.ts'
import { type GroupDatabase, hasLoadedGroupMembers } from '../group/index.ts'

import { type GroupExerciseActionModel, type GroupExerciseEventModel, type GroupExerciseEventRecord, type GroupExerciseSampleModel, type GroupExerciseSampleRecord, type GroupExerciseSampleWithEvents, type GroupWithExercises, hasLoadedGroupExercises } from './models.ts'

export interface GroupExerciseDatabase extends GroupDatabase {
	GroupExerciseAction: GroupExerciseActionModel
	GroupExerciseEvent: GroupExerciseEventModel
	GroupExerciseSample: GroupExerciseSampleModel
}

export const groupExerciseEvents = { groupExerciseUpdated: 'GROUP_EXERCISE_UPDATED' } as const

export type GroupExerciseUpdateAction = 'cancelAction' | 'resolveEvent' | 'startExercise' | 'submitAction'

export interface GroupExerciseUpdatedPayload {
	updatedGroupExercise: GroupExerciseSampleWithEvents
	code: string
	action: GroupExerciseUpdateAction
}

function getLastResolvedGroupEvent(exercise: GroupExerciseSampleRecord): GroupExerciseEventRecord | null {
	const events = (exercise.events ?? []).filter(event => event.state !== null)
	return findOptimum(events, (a, b) => a.updatedAt.getTime() > b.updatedAt.getTime()) ?? null
}

export function getGroupExerciseState(exercise: GroupExerciseSampleRecord): ExerciseState {
	return getLastResolvedGroupEvent(exercise)?.state ?? exercise.initialState
}

async function deactivateMissingGroupExercises(group: GroupWithExercises | null, { transaction }: ServiceOptions = {}): Promise<GroupWithExercises | null> {
	if (!group) return null
	await Promise.all(group.exercises.filter(exercise => exercise.active && !getExercise(exercise.skillId, exercise.exerciseId)).map(exercise => exercise.update({ active: false }, transaction ? { transaction } : {})))
	return group
}

interface GetGroupWithExercisesOptions extends ServiceOptions {
	where?: Record<string, unknown>
}

async function getGroupWithExercises(db: GroupExerciseDatabase, code: string, { where, transaction }: GetGroupWithExercisesOptions = {}): Promise<GroupWithExercises | null> {
	const group = await db.Group.findOne({
		...(transaction ? { transaction } : {}),
		where: { code: code.toUpperCase() },
		include: [{ association: 'members' }, {
			association: 'exercises', ...(where ? { where } : {}), required: false,
			include: [{ association: 'events', required: false, include: [{ association: 'actions', required: false }] }],
		}],
	})
	if (!group) return null
	if (!hasLoadedGroupMembers(group)) throw new Error(`Failed to load members of group "${group.code}".`)
	if (!hasLoadedGroupExercises(group)) throw new Error(`Failed to load exercises, events, and actions of group "${group.code}".`)
	await deactivateMissingGroupExercises(group, { ...(transaction ? { transaction } : {}) })
	if (where?.active) group.exercises = group.exercises.filter(exercise => exercise.active)
	return group
}

export function getGroupWithActiveExercises(db: GroupExerciseDatabase, code: string, options: ServiceOptions = {}): Promise<GroupWithExercises | null> {
	return getGroupWithExercises(db, code, { ...options, where: { active: true } })
}
export function getGroupWithAllExercises(db: GroupExerciseDatabase, code: string, options: ServiceOptions = {}): Promise<GroupWithExercises | null> {
	return getGroupWithExercises(db, code, options)
}
export function getGroupWithActiveSkillExercise(db: GroupExerciseDatabase, code: string, skillId: SkillId, options: ServiceOptions = {}): Promise<GroupWithExercises | null> {
	return getGroupWithExercises(db, code, { ...options, where: { skillId, active: true } })
}
