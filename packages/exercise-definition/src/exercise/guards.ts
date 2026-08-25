import { isPlainObject } from '@step-wise/js-utils'

import { type ExerciseMode, ensureExerciseMode, exerciseModes, exerciseReducerNameByMode } from '../modes'

import type { Exercise, ExerciseSpec } from './types'
import { isExerciseMetadata } from './metadata'

export function isExerciseSpec(obj: unknown): obj is ExerciseSpec<any, any> {
	return isPlainObject(obj) && isExerciseMetadata(obj.metadata) && (obj.generateParameters === undefined || typeof obj.generateParameters === 'function') && (obj.getInitialState === undefined || typeof obj.getInitialState === 'function')
}

export function isExercise(obj: unknown): obj is Exercise<any, any, any, any> {
	return isExerciseSpec(obj) && typeof obj.generateParameters === 'function' && typeof obj.getInitialState === 'function' && exerciseModes.some(mode => exerciseSupportsMode(obj as Exercise, mode))
}

export function exerciseSupportsMode(exercise: Exercise, mode: ExerciseMode): boolean {
	const reducerName = exerciseReducerNameByMode[ensureExerciseMode(mode)]
	return typeof exercise[reducerName] === 'function'
}
