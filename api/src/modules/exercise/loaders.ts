import DataLoader from 'dataloader'

import { fromKeys } from '@step-wise/js-utils'

import type { LoaderContext } from '../types.ts'

import { type ExerciseEventRecord, type ExerciseSampleWithEvents, hasLoadedExerciseEvents } from './models.ts'

export interface ExerciseLoaders {
	exercisesForSkill: DataLoader<string, ExerciseSampleWithEvents[]>
	latestExerciseForSkill: DataLoader<string, ExerciseSampleWithEvents | null>
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
			exercises.forEach(exercise => {
				const exercisesForSkill = groupedExercises[exercise.userSkillId]
				if (!exercisesForSkill) throw new Error(`Received an exercise for unexpected user skill "${exercise.userSkillId}".`)
				exercisesForSkill.push(exercise)
			})
			Object.values(groupedExercises).forEach(exerciseList => exerciseList.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()))
			return userSkillIds.map(id => groupedExercises[id] ?? [])
		}),

		latestExerciseForSkill: new DataLoader<string, ExerciseSampleWithEvents | null>(async userSkillIds => {
			// Load in the exercises.
			const sequelize = db.ExerciseSample.sequelize
			if (!sequelize) throw new Error('Cannot load latest exercises before the exercise model is initialized.')
			const exercises = await sequelize.query(`
				SELECT DISTINCT ON ("userSkillId") *
				FROM "exerciseSamples"
				WHERE "userSkillId" IN (:userSkillIds)
				ORDER BY "userSkillId", "createdAt" DESC, "id" DESC
			`, { replacements: { userSkillIds }, model: db.ExerciseSample, mapToModel: true })

			// Load in the events.
			const exerciseIds = exercises.map(exercise => exercise.id)
			const events = exerciseIds.length === 0 ? [] : await db.ExerciseEvent.findAll({
				where: { exerciseSampleId: exerciseIds },
				order: [['exerciseSampleId', 'ASC'], ['createdAt', 'ASC']],
			})

			// Couple events to exercises.
			const eventsByExercise: Record<string, ExerciseEventRecord[]> = fromKeys(exerciseIds, () => [])
			events.forEach(event => {
				const exerciseEvents = eventsByExercise[event.exerciseSampleId]
				if (!exerciseEvents) throw new Error(`Received an event for unexpected exercise sample "${event.exerciseSampleId}".`)
				exerciseEvents.push(event)
			})

			// Couple exercises to skills.
			const latestExerciseBySkill: Record<string, ExerciseSampleWithEvents | null> = fromKeys(userSkillIds, () => null)
			exercises.forEach(exercise => {
				const events = eventsByExercise[exercise.id]
				if (!events) throw new Error(`Failed to load events for exercise sample "${exercise.id}".`)
				exercise.events = events
				if (!hasLoadedExerciseEvents(exercise)) throw new Error(`Failed to attach events to exercise sample "${exercise.id}".`)
				latestExerciseBySkill[exercise.userSkillId] = exercise
			})

			// Return the exercises in the same order as the requested skills.
			return userSkillIds.map(userSkillId => latestExerciseBySkill[userSkillId] ?? null)
		}),
	}
}
