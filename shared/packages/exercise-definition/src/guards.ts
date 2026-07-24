import { isPlainObject } from '@step-wise/utils'

import type { ExerciseSpec, Exercise, ExerciseContainer } from './types'

// Check if the given value is an ExerciseSpec.
export function isExerciseSpec(obj: unknown): obj is ExerciseSpec<any, any> {
	return isPlainObject(obj) && isPlainObject(obj.metaData) && typeof obj.generateState === 'function'
}

// Check if the given value is an Exercise.
export function isExercise(obj: unknown): obj is Exercise<any, any, any, any> {
	return isExerciseSpec(obj) && 'processAction' in obj && typeof obj.processAction === 'function'
}

// Check if we have a set of exercises in a container.
export function isExerciseContainer(obj: unknown): obj is ExerciseContainer {
	if (!isPlainObject(obj)) return false
	return Object.values(obj).every(exercise => isExercise(exercise))
}
