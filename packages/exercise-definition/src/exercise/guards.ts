import { isPlainObject } from '@step-wise/js-utils'

import { type ExerciseMode, ensureExerciseMode, exerciseModes, exerciseReducerNameByMode } from '../modes/index.ts'

import type { AnyExercise, Exercise } from './types.ts'
import { isExerciseMetadata } from './metadata.ts'

export function isExercise<T>(obj: T): obj is T & AnyExercise {
	return isPlainObject(obj) && isExerciseMetadata(obj.metadata) && typeof obj.generateParameters === 'function' && typeof obj.getInitialState === 'function' && exerciseModes.some(mode => typeof obj[exerciseReducerNameByMode[mode]] === 'function')
}

export function exerciseSupportsMode(exercise: Exercise, mode: ExerciseMode): boolean {
	const reducerName = exerciseReducerNameByMode[ensureExerciseMode(mode)]
	return typeof exercise[reducerName] === 'function'
}
