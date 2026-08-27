import DataLoader from 'dataloader'
import { fromKeys } from '@step-wise/js-utils'

import type { LoaderContext } from '../types.ts'

import type { ExerciseSampleRecord } from './models.ts'

export interface ExerciseLoaders {
	exercisesForSkill: DataLoader<string, ExerciseSampleRecord[]>
}

declare module '../types.ts' {
	interface ApiLoaders extends ExerciseLoaders {}
}

export function createExerciseLoaders(context: LoaderContext): ExerciseLoaders {
	const { db } = context
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
