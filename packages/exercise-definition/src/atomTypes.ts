import { type PlainDataObject, isPlainDataObject } from '@step-wise/js-utils'

export type ExerciseParameters = PlainDataObject
export type ExerciseAction = PlainDataObject & { type: string }
export type ExerciseState = PlainDataObject

export function isExerciseAction(value: unknown): value is ExerciseAction {
	return isPlainDataObject(value) && typeof value.type === 'string'
}

export function ensureExerciseAction(value: unknown): ExerciseAction {
	if (!isExerciseAction(value)) throw new TypeError('Invalid exercise action: expected a plain data object with a string "type" property.')
	return value
}
