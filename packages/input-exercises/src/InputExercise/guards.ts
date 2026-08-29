import { isPlainObject } from '@step-wise/js-utils'
import { isExercise } from '@step-wise/exercise-definition'
import { isValueTypes } from '@step-wise/value-types'

import type { SolutionDefinition } from './types.ts'

function isSolutionDefinition(value: unknown): value is SolutionDefinition {
	if (typeof value === 'function') return true
	if (!isPlainObject(value) || typeof value.getStaticSolution !== 'function') return false
	if (value.dependentFields !== undefined && (!Array.isArray(value.dependentFields) || !value.dependentFields.every(field => typeof field === 'string'))) return false
	if (value.getInputDependency !== undefined && typeof value.getInputDependency !== 'function') return false
	return value.getDynamicSolution === undefined || typeof value.getDynamicSolution === 'function'
}

export function hasInputExerciseProperties(value: unknown): value is Record<string, unknown> & { metadata: Record<string, unknown> } {
	if (!isPlainObject(value) || !isExercise(value)) return false
	const candidate = value as typeof value & Record<string, unknown>
	if (candidate.valueTypes !== undefined && !isValueTypes(candidate.valueTypes)) return false
	if (typeof candidate.checkInput !== 'function' || typeof candidate.processSoloAction !== 'function' || typeof candidate.processGroupActions !== 'function') return false
	return candidate.getSolution === undefined || isSolutionDefinition(candidate.getSolution)
}
