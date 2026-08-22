import { isPlainObject } from '@step-wise/js-utils'
import { type AnyExercise, isExercise } from '@step-wise/exercise-definition'

// A set of exercises, bundled in a container.
export type ExerciseId = string
export type ExerciseContainer = Record<ExerciseId, AnyExercise>

// Check if we have a set of exercises in a container.
export function isExerciseContainer(obj: unknown): obj is ExerciseContainer {
	if (!isPlainObject(obj)) return false
	return Object.values(obj).every(exercise => isExercise(exercise))
}

// Check if an exercise container is empty.
export function isEmptyExerciseContainer(exerciseContainer?: ExerciseContainer) {
	if (exerciseContainer === undefined) return true
	return Object.values(exerciseContainer).length === 0
}
