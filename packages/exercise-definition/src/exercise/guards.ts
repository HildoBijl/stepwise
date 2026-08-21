import { isPlainObject } from '@step-wise/js-utils'

import { exerciseModes, exerciseReducerNameByMode } from '../modes'
import type { Exercise, ExerciseSpec } from './types'

export function isExerciseSpec(obj: unknown): obj is ExerciseSpec<any, any> {
	return isPlainObject(obj) && isPlainObject(obj.metaData) && typeof obj.generateState === 'function'
}

export function isExercise(obj: unknown): obj is Exercise<any, any, any, any> {
	return isExerciseSpec(obj) && exerciseModes.some(mode => {
		const reducerName = exerciseReducerNameByMode[mode]
		return typeof Reflect.get(obj, reducerName) === 'function'
	})
}
