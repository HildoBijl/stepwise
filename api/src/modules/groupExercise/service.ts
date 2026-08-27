import type { ExerciseState } from '@step-wise/exercise-definition'
import type { SkillId } from '@step-wise/skill-definition'
import { findOptimum } from '@step-wise/js-utils'
import { getExercise } from '@step-wise/exercises'

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

async function deactivateMissingGroupExercises(group: GroupWithExercises | null): Promise<GroupWithExercises | null> {
	if (!group) return null
	await Promise.all(group.exercises.filter(exercise => exercise.active && !getExercise(exercise.skillId, exercise.exerciseId)).map(exercise => exercise.update({ active: false })))
	return group
}

async function getGroupWithExercises(code: string, db: GroupExerciseDatabase, where?: Record<string, unknown>): Promise<GroupWithExercises | null> {
	const group = await db.Group.findOne({
		where: { code: code.toUpperCase() },
		include: [{ association: 'members' }, {
			association: 'exercises', ...(where ? { where } : {}), required: false,
			include: [{ association: 'events', required: false, include: [{ association: 'actions', required: false }] }],
		}],
	})
	if (!group) return null
	if (!hasLoadedGroupMembers(group)) throw new Error(`Failed to load members of group "${group.code}".`)
	if (!hasLoadedGroupExercises(group)) throw new Error(`Failed to load exercises, events, and actions of group "${group.code}".`)
	await deactivateMissingGroupExercises(group)
	if (where?.active) group.exercises = group.exercises.filter(exercise => exercise.active)
	return group
}

export function getGroupWithActiveExercises(code: string, db: GroupExerciseDatabase): Promise<GroupWithExercises | null> {
	return getGroupWithExercises(code, db, { active: true })
}
export function getGroupWithAllExercises(code: string, db: GroupExerciseDatabase): Promise<GroupWithExercises | null> {
	return getGroupWithExercises(code, db)
}
export function getGroupWithActiveSkillExercise(code: string, skillId: SkillId, db: GroupExerciseDatabase): Promise<GroupWithExercises | null> {
	return getGroupWithExercises(code, db, { skillId, active: true })
}
