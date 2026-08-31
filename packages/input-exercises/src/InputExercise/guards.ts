import { isPlainObject } from '@step-wise/js-utils'
import { isExercise } from '@step-wise/exercise-definition'

import type { SolutionDefinition, ValueOperations } from './types.ts'

function isSolutionDefinition(value: unknown): value is SolutionDefinition {
	if (typeof value === 'function') return true
	if (!isPlainObject(value) || typeof value.getStaticSolution !== 'function') return false
	if (value.getDynamicSolution === undefined) return value.dependentFields === undefined && value.getInputDependency === undefined
	if (typeof value.getDynamicSolution !== 'function') return false
	if (value.dependentFields !== undefined && (!Array.isArray(value.dependentFields) || !value.dependentFields.every(field => typeof field === 'string'))) return false
	return value.getInputDependency === undefined || typeof value.getInputDependency === 'function'
}

function isValueOperations(value: unknown): value is ValueOperations {
	return isPlainObject(value) && typeof value.deserializeParameters === 'function' && typeof value.interpretInput === 'function' && typeof value.toInputValue === 'function' && typeof value.areValuesEqual === 'function'
}

export function hasInputExerciseProperties(value: unknown): value is Record<string, unknown> & { metadata: Record<string, unknown> } {
	if (!isPlainObject(value) || !isExercise(value)) return false
	if (!isValueOperations(value.valueOperations)) return false
	if (typeof value.checkInput !== 'function' || typeof value.processSoloAction !== 'function' || typeof value.processGroupActions !== 'function') return false
	return value.getSolution === undefined || isSolutionDefinition(value.getSolution)
}
