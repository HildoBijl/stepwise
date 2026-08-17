import { isPlainObject } from '@step-wise/js-utils'

import type { ExerciseSpec, Exercise } from './types'

// Check if the given value is an ExerciseSpec.
export function isExerciseSpec(obj: unknown): obj is ExerciseSpec<any, any> {
	return isPlainObject(obj) && isPlainObject(obj.metaData) && typeof obj.generateState === 'function'
}

// Check if the given value is an Exercise.
export function isExercise(obj: unknown): obj is Exercise<any, any, any, any> {
	return isExerciseSpec(obj) && 'processAction' in obj && typeof obj.processAction === 'function'
}
