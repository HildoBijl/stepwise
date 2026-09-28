import { hasOnlyKeys, isPlainDataValue, isPlainObject } from '@step-wise/js-utils'

import { hasInputExerciseProperties } from '../InputExercise/guards.ts'
import { isInputExerciseHistory } from '../InputExercise/historyGuards.ts'

import type { MonoExercise, MonoExerciseHistory, MonoExerciseState } from './types.ts'

export function isMonoExercise(value: unknown): value is MonoExercise<any, any> {
	return hasInputExerciseProperties(value) && value.type === 'mono'
}

export function isMonoExerciseState(value: unknown): value is MonoExerciseState {
	return isPlainObject(value)
		&& hasOnlyKeys(value, ['attempted', 'attemptedBy', 'inputDependency', 'inputDependencies', 'solved', 'givenUp', 'done'])
		&& (value.attempted === undefined || value.attempted === true)
		&& (value.attemptedBy === undefined || (Array.isArray(value.attemptedBy) && value.attemptedBy.every(userId => typeof userId === 'string')))
		&& (value.inputDependency === undefined || isPlainDataValue(value.inputDependency))
		&& (value.inputDependencies === undefined || (isPlainObject(value.inputDependencies) && Object.values(value.inputDependencies).every(isPlainDataValue)))
		&& (value.solved === undefined || value.solved === true)
		&& (value.givenUp === undefined || value.givenUp === true)
		&& (value.done === undefined || value.done === true)
}

export function isMonoExerciseHistory(value: unknown): value is MonoExerciseHistory {
	return isInputExerciseHistory(value, isMonoExerciseState)
}
