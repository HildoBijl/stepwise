import { hasInputExerciseProperties } from '../InputExercise'

import type { StepExercise } from './types'

export function isStepExercise(value: unknown): value is StepExercise<any, any> {
	return hasInputExerciseProperties(value) && value.type === 'step' && Array.isArray(value.metadata.steps)
}
