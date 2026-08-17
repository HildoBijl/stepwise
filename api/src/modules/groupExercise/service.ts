import { findOptimum } from '@step-wise/js-utils'
import { getExercise } from '@step-wise/exercises'

export const groupExerciseEvents = { groupExerciseUpdated: 'GROUP_EXERCISE_UPDATED' } as const

function getLastResolvedGroupEvent(exercise: any) {
	const events = (exercise.events || []).filter((event: any) => event.progress !== null)
	return findOptimum(events, (a: any, b: any) => a.updatedAt > b.updatedAt) || null
}

export function getGroupExerciseProgress(exercise: any) {
	return getLastResolvedGroupEvent(exercise)?.progress ?? {}
}

async function deactivateMissingGroupExercises(group: any) {
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
