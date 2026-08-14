import DataLoader from 'dataloader'
import { fromKeys } from '@step-wise/utils'

import type { ApiContext, ApiLoaders } from '../types.ts'

import type { ExerciseSampleRecord } from './models.ts'
import type { ExerciseDatabase } from './service.ts'

export function createExerciseLoaders(context: ApiContext): ApiLoaders {
	const db = context.db as ExerciseDatabase
	return {
		exercisesForSkill: new DataLoader<string, ExerciseSampleRecord[]>(async userSkillIds => {
			const exercises = await db.ExerciseSample.findAll({ where: { userSkillId: userSkillIds }, include: [{ association: 'events', order: [['createdAt', 'ASC']], separate: true }] })
			const groupedExercises: Record<string, ExerciseSampleRecord[]> = fromKeys(userSkillIds, () => [])
			exercises.forEach(exercise => groupedExercises[exercise.userSkillId].push(exercise))
			Object.values(groupedExercises).forEach(exerciseList => exerciseList.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()))
			return userSkillIds.map(id => groupedExercises[id])
		})
	}
}
