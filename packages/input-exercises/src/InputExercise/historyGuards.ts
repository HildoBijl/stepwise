import { hasOnlyKeys, isPlainDataObject, isPlainObject } from '@step-wise/js-utils'

import { isInputExerciseAction } from './guards.ts'

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
