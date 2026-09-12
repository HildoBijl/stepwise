import { getExercise } from '@step-wise/exercises'

import { ensureGroupMembership, getGroup, hasLoadedGroupMembers } from '../../group/index.ts'

import { getGroupExerciseById, getLatestGroupExercise } from '../service.ts'
import type { GroupExerciseContext } from './types.ts'

export const groupExerciseQueryResolvers = {
	latestGroupExercise: async (_source: unknown, { code, skillId }: { code: string; skillId: string }, { db, ensureSignedIn, userId }: GroupExerciseContext) => {
		ensureSignedIn()
		const group = await getGroup(db, code, { includeMembers: true })
		ensureGroupMembership(group, userId)
		const exercise = await getLatestGroupExercise(db, group.id, skillId)
		return exercise && getExercise(exercise.skillId, exercise.exerciseId) ? exercise : null
	},
	groupExercise: async (_source: unknown, { id }: { id: string }, { db, ensureSignedIn, userId }: GroupExerciseContext) => {
		ensureSignedIn()
		const exercise = await getGroupExerciseById(db, id)
		if (!exercise) return null
		const group = await db.Group.findByPk(exercise.groupId, { include: { association: 'members' } })
		if (group && !hasLoadedGroupMembers(group)) throw new Error(`Failed to load members of group "${group.code}".`)
		ensureGroupMembership(group, userId)
		return getExercise(exercise.skillId, exercise.exerciseId) ? exercise : null
	},
}
