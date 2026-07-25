import { isPlainObject } from '@step-wise/utils'

import { type ExerciseDefinition } from './types'
import { isExercise } from './guards'

// A set of exercises, bundled in a container.
export type ExerciseId = string
export type ExerciseContainer = Record<ExerciseId, ExerciseDefinition>

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
