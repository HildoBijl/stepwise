import { hasOnlyKeys, isPlainDataObject, isPlainObject } from '@step-wise/js-utils'

import { hasInputExerciseProperties, isInputExerciseAction } from '../InputExercise/guards.ts'
import type { MonoExercise } from '../MonoExercise/types.ts'
import type { StepExercise } from '../StepExercise/types.ts'

import type { InputExerciseInstance } from './history.ts'

export type AnyInputExercise = MonoExercise<any, any, any> | StepExercise<any, any, any>

export function isInputExercise(value: unknown): value is AnyInputExercise {
	if (!hasInputExerciseProperties(value)) return false
	return value.type === 'mono' || (value.type === 'step' && Array.isArray(value.metadata.steps))
}

export function isInputExerciseInstance(value: unknown): value is InputExerciseInstance {
	if (!isPlainObject(value) || !isPlainDataObject(value.parameters) || !isPlainDataObject(value.initialState) || !Array.isArray(value.history)) return false
	switch (value.mode) {
		case 'solo': return value.history.every(isInputExerciseSoloEvent)
		case 'group': return value.history.every(isInputExerciseGroupEvent)
		default: return false
	}
}

export function isInputExerciseHistory(value: unknown, isState: (value: unknown) => boolean): boolean {
	return Array.isArray(value) && (value.every(event => isSoloHistoryEvent(event, isState)) || value.every(event => isGroupHistoryEvent(event, isState)))
}

function isSoloHistoryEvent(value: unknown, isState: (value: unknown) => boolean): boolean {
	return isPlainObject(value)
		&& hasOnlyKeys(value, ['action', 'state', 'report'])
		&& isInputExerciseAction(value.action)
		&& isState(value.state)
		&& (value.report === undefined || isPlainDataObject(value.report))
}

function isGroupHistoryEvent(value: unknown, isState: (value: unknown) => boolean): boolean {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['actions', 'state', 'report']) || !Array.isArray(value.actions) || !value.actions.every(isUserAction)) return false
	if (!Object.prototype.hasOwnProperty.call(value, 'state')) return !Object.prototype.hasOwnProperty.call(value, 'report')
	return isState(value.state) && (value.report === undefined || (isPlainObject(value.report) && Object.values(value.report).every(isPlainDataObject)))
}

function isUserAction(value: unknown): boolean {
	return isPlainObject(value) && hasOnlyKeys(value, ['userId', 'action']) && typeof value.userId === 'string' && isInputExerciseAction(value.action)
}

function isInputExerciseSoloEvent(value: unknown): boolean {
	return isPlainObject(value)
		&& isInputExerciseAction(value.action)
		&& isPlainDataObject(value.state)
		&& (value.report === undefined || isPlainDataObject(value.report))
}

function isInputExerciseGroupEvent(value: unknown): boolean {
	if (!isPlainObject(value) || !Array.isArray(value.actions) || !value.actions.every(userAction => isPlainObject(userAction) && typeof userAction.userId === 'string' && isInputExerciseAction(userAction.action))) return false
	if (!Object.prototype.hasOwnProperty.call(value, 'state')) return !Object.prototype.hasOwnProperty.call(value, 'report')
	return isPlainDataObject(value.state) && (value.report === undefined || (isPlainObject(value.report) && Object.values(value.report).every(isPlainDataObject)))
}
