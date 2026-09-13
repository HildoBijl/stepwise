import { isPlainObject } from '@step-wise/js-utils'
import { isExercise } from '@step-wise/exercise-definition'

import type { InputExerciseValueOperations } from './types.ts'

function isInputExerciseValueOperations(value: unknown): value is InputExerciseValueOperations {
	return isPlainObject(value) && typeof value.serialize === 'function' && typeof value.deserialize === 'function' && typeof value.interpretInput === 'function' && typeof value.toInputValue === 'function' && typeof value.areValuesEqual === 'function'
}

export function hasInputExerciseProperties(value: unknown): value is Record<string, unknown> & { metadata: Record<string, unknown> } {
	if (!isPlainObject(value) || !isExercise(value)) return false
	if (!isInputExerciseValueOperations(value.valueOperations)) return false
	if (typeof value.checkInput !== 'function' || typeof value.processSoloAction !== 'function' || typeof value.processGroupActions !== 'function') return false
	if (value.getInitialInputDependency !== undefined && typeof value.getInitialInputDependency !== 'function') return false
	if (value.updateInputDependency !== undefined && typeof value.updateInputDependency !== 'function') return false
	if (value.getStaticSolution !== undefined && typeof value.getStaticSolution !== 'function') return false
	if (value.getSolution !== undefined && typeof value.getSolution !== 'function') return false
	if (value.getInitialInputDependency !== undefined && value.updateInputDependency === undefined) return false
	if (value.getStaticSolution !== undefined && value.updateInputDependency === undefined) return false
	if (value.updateInputDependency !== undefined && value.getSolution === undefined) return false
	return true
}
