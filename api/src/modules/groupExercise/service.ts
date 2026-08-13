import { ForbiddenError, UserInputError } from 'apollo-server-express'
import { getExercise } from '@step-wise/exercises'
import { findOptimum } from '@step-wise/utils'

export const GROUP_EXERCISE_EVENTS = { groupExerciseUpdated: 'GROUP_EXERCISE_UPDATED' } as const

export function getLastResolvedGroupEvent(exercise: any) {
	const events = (exercise.events || []).filter((event: any) => event.progress !== null)
	return findOptimum(events, (a: any, b: any) => a.updatedAt > b.updatedAt) || null
}

export function getUnresolvedGroupEvent(exercise: any) {
	return (exercise.events || []).find((event: any) => event.progress === null) || null
}
export function getGroupExerciseProgress(exercise: any) {
	return getLastResolvedGroupEvent(exercise)?.progress ?? {}
}

export function verifyGroupAccess(group: any, userId: string) {
	if (!group) throw new UserInputError('No group with the given code exists.')
	const member = group.members?.find((candidate: any) => candidate.id === userId)
	if (!member) throw new ForbiddenError(`Access to group "${group.code}" is not allowed: the user is not a member.`)
	if (!member.groupMembership.active) throw new ForbiddenError(`Access to group "${group.code}" is not allowed: the user is currently not active in that group.`)
}

export async function deactivateMissingGroupExercises(group: any) {
	if (!group) return group
	await Promise.all(group.exercises.filter((exercise: any) => exercise.active && !getExercise(exercise.skillId, exercise.exerciseId)).map((exercise: any) => exercise.update({ active: false })))
	return group
}

async function getGroupWithExercises(code: string, db: any, where?: Record<string, unknown>) {
	const group = await db.Group.findOne({
		where: { code: code.toUpperCase() },
		include: [{ association: 'members' }, {
			association: 'exercises', where, required: false,
			include: { association: 'events', required: false, include: { association: 'submissions', required: false } },
		}],
	})
	await deactivateMissingGroupExercises(group)
	if (group && where?.active) group.exercises = group.exercises.filter((exercise: any) => exercise.active)
	return group
}

export function getGroupWithActiveExercises(code: string, db: any) {
	return getGroupWithExercises(code, db, { active: true })
}
export function getGroupWithAllExercises(code: string, db: any) {
	return getGroupWithExercises(code, db)
}
export function getGroupWithActiveSkillExercise(code: string, skillId: string, db: any) {
	return getGroupWithExercises(code, db, { skillId, active: true })
}
export function processGroupExercises(group: any) {
	return group
}
