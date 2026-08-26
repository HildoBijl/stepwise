import { filterProperties, isPlainObject } from '@step-wise/js-utils'
import { type AnyExercise, type ExerciseMode, ensureExerciseMode, exerciseSupportsMode, isExercise } from '@step-wise/exercise-definition'

// A keyed collection of exercises.
export type ExerciseId = string
export type ExerciseCollection = Readonly<Record<ExerciseId, AnyExercise>>

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

// Return only the exercises that support the requested mode.
export function filterExerciseCollectionByMode(exerciseCollection: ExerciseCollection, mode: ExerciseMode): ExerciseCollection {
	const ensuredMode = ensureExerciseMode(mode)
	return filterProperties(exerciseCollection, exercise => exerciseSupportsMode(exercise, ensuredMode)) as ExerciseCollection
}
