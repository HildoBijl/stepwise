import { isPlainObject } from '@step-wise/js-utils'
import { type AnyExercise, isExercise } from '@step-wise/exercise-definition'

// A keyed collection of exercises.
export type ExerciseId = string
export type ExerciseCollection = Record<ExerciseId, AnyExercise>

// Check if a value is an exercise collection.
export function isExerciseCollection(obj: unknown): obj is ExerciseCollection {
	if (!isPlainObject(obj)) return false
	return Object.entries(obj).every(([exerciseId, exercise]) => exerciseId.length > 0 && exerciseId.trim() === exerciseId && isExercise(exercise))
}

// Check if an exercise collection is empty.
export function isEmptyExerciseCollection(exerciseCollection?: ExerciseCollection) {
	if (exerciseCollection === undefined) return true
	return Object.values(exerciseCollection).length === 0
}
