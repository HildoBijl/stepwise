import type { GroupExerciseRecord } from './records.ts'

export function upsertGroupExerciseRecord(updatedExercise: GroupExerciseRecord, exercises: readonly GroupExerciseRecord[]): GroupExerciseRecord[] {
	if (exercises.some(exercise => exercise.skillId === updatedExercise.skillId)) return exercises.map(exercise => exercise.skillId === updatedExercise.skillId ? updatedExercise : exercise)
	return [...exercises, updatedExercise]
}
