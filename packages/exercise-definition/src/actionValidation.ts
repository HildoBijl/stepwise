import { isPlainDataObject } from '@step-wise/js-utils'

import type { ExerciseAction } from './types.ts'

export function isExerciseAction(value: unknown): value is ExerciseAction {
	return isPlainDataObject(value) && typeof value.type === 'string'
}

export function ensureExerciseAction(value: unknown): ExerciseAction {
	if (!isExerciseAction(value)) throw new TypeError('Invalid exercise action: expected a plain data object with a string "type" property.')
	return value
}
