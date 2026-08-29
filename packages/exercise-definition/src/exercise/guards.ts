import { isPlainObject } from '@step-wise/js-utils'

import { type ExerciseMode, ensureExerciseMode, exerciseModes, exerciseReducerNameByMode } from '../modes/index.ts'

import type { AnyExercise, Exercise, ExerciseSpec } from './types.ts'
import { isExerciseMetadata } from './metadata.ts'

export function isExerciseSpec<T>(obj: T): obj is T & ExerciseSpec<any, any> {
	return isPlainObject(obj) && isExerciseMetadata(obj.metadata) && (obj.generateParameters === undefined || typeof obj.generateParameters === 'function') && (obj.getInitialState === undefined || typeof obj.getInitialState === 'function')
}

export function isExercise<T>(obj: T): obj is T & AnyExercise {
	return isExerciseSpec(obj) && typeof obj.generateParameters === 'function' && typeof obj.getInitialState === 'function' && exerciseModes.some(mode => exerciseSupportsMode(obj as Exercise, mode))
}

export function exerciseSupportsMode(exercise: Exercise, mode: ExerciseMode): boolean {
	const reducerName = exerciseReducerNameByMode[ensureExerciseMode(mode)]
	return typeof exercise[reducerName] === 'function'
}
