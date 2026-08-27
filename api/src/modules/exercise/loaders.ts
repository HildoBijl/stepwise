import DataLoader from 'dataloader'
import { fromKeys } from '@step-wise/js-utils'

import type { LoaderContext } from '../types.ts'

import { type ExerciseSampleWithEvents, hasLoadedExerciseEvents } from './models.ts'

export interface ExerciseLoaders {
	exercisesForSkill: DataLoader<string, ExerciseSampleWithEvents[]>
}

declare module '../types.ts' {
	interface ApiLoaders extends ExerciseLoaders {}
}

export function createExerciseLoaders(context: LoaderContext): ExerciseLoaders {
	const { db } = context
	return {
		exercisesForSkill: new DataLoader<string, ExerciseSampleWithEvents[]>(async userSkillIds => {
			const exercises = await db.ExerciseSample.findAll({ where: { userSkillId: userSkillIds }, include: [{ association: 'events', order: [['createdAt', 'ASC']], separate: true }] })
			if (!exercises.every(hasLoadedExerciseEvents)) throw new Error('Failed to load exercise events for one or more exercise samples.')
			const groupedExercises: Record<string, ExerciseSampleWithEvents[]> = fromKeys(userSkillIds, () => [])
			exercises.forEach(exercise => groupedExercises[exercise.userSkillId].push(exercise))
			Object.values(groupedExercises).forEach(exerciseList => exerciseList.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()))
			return userSkillIds.map(id => groupedExercises[id])
		})
	}
}
