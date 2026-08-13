import DataLoader from 'dataloader'
import type { ApiContext, LoaderFactory } from '../types'

export const createExerciseLoaders: LoaderFactory = (context: ApiContext) => {
	const db = context.db as any
	return { exercisesForSkill: new DataLoader<string, any[]>(async userSkillIds => {
		const exercises = await db.ExerciseSample.findAll({ where: { userSkillId: userSkillIds }, include: [{ association: 'events', order: [['createdAt', 'ASC']], separate: true }] })
		const grouped: Record<string, any[]> = Object.fromEntries(userSkillIds.map(id => [id, []]))
		exercises.forEach((exercise: any) => grouped[exercise.userSkillId].push(exercise))
		userSkillIds.forEach(id => grouped[id].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()))
		return userSkillIds.map(id => grouped[id])
	}) }
}
