import { hasOnlyKeys, isInteger, isPlainDataValue, isPlainObject } from '@step-wise/js-utils'

import { hasInputExerciseProperties } from '../InputExercise/guards.ts'
import { isInputExerciseHistory } from '../InputExercise/historyGuards.ts'

import type { StepExercise, StepExerciseHistory, StepExerciseState, StepExerciseStepState } from './types.ts'

const inputExerciseStateKeys = ['attempted', 'attemptedBy', 'inputDependency', 'inputDependencies']
const unsplitStateKeys = [...inputExerciseStateKeys, 'solved', 'done']
const splitStateKeys = [...inputExerciseStateKeys, 'split', 'step', 'done']
const stepStateKeys = ['attempted', 'attemptedBy', 'solved', 'givenUp', 'done']

export function isStepExercise(value: unknown): value is StepExercise<any, any> {
	return hasInputExerciseProperties(value) && value.type === 'step' && Array.isArray(value.metadata.steps)
}

export function isStepExerciseState(value: unknown): value is StepExerciseState {
	if (!isPlainObject(value) || !hasValidInputExerciseState(value)) return false
	if (value.split === undefined) {
		return hasOnlyKeys(value, unsplitStateKeys)
			&& (value.solved === undefined || value.solved === true)
			&& (value.done === undefined || value.done === true)
	}
	if (value.split !== true || !isInteger(value.step) || value.step < 0) return false
	return Object.entries(value).every(([key, entry]) => splitStateKeys.includes(key) || (isStepId(key) && isStepExerciseStepState(entry)))
		&& (value.done === undefined || value.done === true)
}

export function isStepExerciseHistory(value: unknown): value is StepExerciseHistory {
	return isInputExerciseHistory(value, isStepExerciseState)
}

function hasValidInputExerciseState(value: Record<string, unknown>): boolean {
	return (value.attempted === undefined || value.attempted === true)
		&& (value.attemptedBy === undefined || (Array.isArray(value.attemptedBy) && value.attemptedBy.every(userId => typeof userId === 'string')))
		&& (value.inputDependency === undefined || isPlainDataValue(value.inputDependency))
		&& (value.inputDependencies === undefined || (isPlainObject(value.inputDependencies) && Object.values(value.inputDependencies).every(isPlainDataValue)))
}

function isStepExerciseStepState(value: unknown): value is StepExerciseStepState {
	if (!isPlainObject(value)) return false
	return Object.entries(value).every(([key, entry]) => stepStateKeys.includes(key) || (isStepId(key) && entry === true))
		&& (value.attempted === undefined || value.attempted === true)
		&& (value.attemptedBy === undefined || (Array.isArray(value.attemptedBy) && value.attemptedBy.every(userId => typeof userId === 'string')))
		&& (value.solved === undefined || value.solved === true)
		&& (value.givenUp === undefined || value.givenUp === true)
		&& (value.done === undefined || value.done === true)
}

function isStepId(value: string): boolean {
	return /^[1-9]\d*$/.test(value)
}
