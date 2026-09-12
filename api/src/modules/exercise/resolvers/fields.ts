import { getExercise } from '@step-wise/exercises'

import type { SkillResolverSource, UserSkillRecord } from '../../skill/index.ts'

import type { ExerciseContext } from './types.ts'
import type { ExerciseEventRecord, ExerciseSampleRecord } from '../models.ts'
import { type ExerciseUpdatedPayload, getCurrentExerciseState, getExerciseEventIndex, getLatestExerciseEvent } from '../service.ts'

export const exerciseFieldResolvers = {
	Skill: { exerciseData: ({ record, mayViewExerciseData }: SkillResolverSource) => mayViewExerciseData ? record : null },

	SkillExerciseData: {
		exercises: (skill: UserSkillRecord, _args: unknown, { loaders }: ExerciseContext) => loaders.exercisesForSkill.load(skill.id),
		latestExercise: async (skill: UserSkillRecord, _args: unknown, { loaders }: ExerciseContext) => {
			const exercise = await loaders.latestExerciseForSkill.load(skill.id)
			return exercise && getExercise(skill.skillId, exercise.exerciseId) ? exercise : null
		},
	},

	Exercise: {
		mode: () => 'solo',
		startedAt: (exercise: ExerciseSampleRecord) => exercise.createdAt,
		state: getCurrentExerciseState,
		eventIndex: getExerciseEventIndex,
		lastAction: (exercise: ExerciseSampleRecord) => getLatestExerciseEvent(exercise)?.action ?? null,
		lastActionAt: (exercise: ExerciseSampleRecord) => getLatestExerciseEvent(exercise)?.createdAt ?? null,
		history: (exercise: ExerciseSampleRecord) => exercise.events ?? [],
		active: (exercise: ExerciseSampleRecord) => exercise.active,
	},

	ExerciseEvent: { performedAt: (event: ExerciseEventRecord) => event.createdAt },

	ExerciseEventUpdate: {
		exerciseId: ({ updatedExercise }: ExerciseUpdatedPayload) => updatedExercise.id,
		active: ({ updatedExercise }: ExerciseUpdatedPayload) => updatedExercise.active,
		event: ({ updatedExercise }: ExerciseUpdatedPayload) => getLatestExerciseEvent(updatedExercise),
	},
}
