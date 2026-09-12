import type { ExerciseUpdateRecord, SkillWithLatestExerciseRecord } from '../records.ts'

export function mergeExerciseUpdate(skill: SkillWithLatestExerciseRecord, update: ExerciseUpdateRecord, refetch: () => Promise<unknown>): SkillWithLatestExerciseRecord {
	const exercise = skill.exerciseData?.latestExercise
	if (!exercise || exercise.id !== update.exerciseId) {
		void refetch()
		return skill
	}
	if (update.event.eventIndex < exercise.eventIndex) return skill
	if (update.event.eventIndex !== exercise.eventIndex) {
		void refetch()
		return skill
	}
	return {
		...skill,
		exerciseData: {
			latestExercise: {
				...exercise,
				eventIndex: update.event.eventIndex + 1,
				active: update.active,
				state: update.event.state,
				history: [...exercise.history, update.event],
			},
		},
	}
}
