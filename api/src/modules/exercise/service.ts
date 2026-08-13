import { UserInputError } from 'apollo-server-express'
import { getExercise } from '@step-wise/exercises'
import { last } from '@step-wise/utils'

export const getLastEvent = (exercise: any): any => {
	const events = (exercise.events || []).filter((event: any) => event.progress !== null)
	return events.length > 0 ? last(events) : null
}

export const getExerciseProgress = (exercise: any) => getLastEvent(exercise)?.progress ?? {}

export const getUserSkillWithExercises = async (db: any, userId: string, skillId: string, options: any = {}) => {
	const { includeActiveExercise = false, includeExercises = false, requireActiveExercise = false, requireNoActiveExercise = false, createIfNoneExists = false } = options
	const loadExercises = includeActiveExercise || includeExercises || requireActiveExercise || requireNoActiveExercise
	let skill = await db.UserSkill.findOne({
		where: { userId, skillId },
		include: loadExercises ? {
			association: 'exercises', where: includeExercises ? undefined : { active: true }, required: false,
			order: [['createdAt', 'ASC']], separate: true,
			include: { association: 'events', required: false, order: [['createdAt', 'ASC']], separate: true },
		} : undefined,
	})
	if (!skill) {
		if (requireActiveExercise) throw new UserInputError(`There is no active exercise for skill "${skillId}".`)
		if (!createIfNoneExists) return null
		skill = await db.UserSkill.create({ userId, skillId })
	}
	const exercises = skill.exercises || []
	let activeExercise = exercises.find((exercise: any) => exercise.active)
	if (activeExercise && !getExercise(skillId, activeExercise.exerciseId)) {
		await activeExercise.update({ active: false })
		activeExercise = undefined
	}
	if (requireActiveExercise && !activeExercise) throw new UserInputError(`There is no active exercise for skill "${skillId}".`)
	if (requireNoActiveExercise && activeExercise) throw new UserInputError(`There is still an active exercise for skill "${skillId}".`)
	return { skill, exercises, activeExercise }
}
