import { hasInputExerciseProperties } from '../InputExercise/index.ts'

import type { StepExercise } from './types.ts'

export function isStepExercise(value: unknown): value is StepExercise<any, any> {
	return hasInputExerciseProperties(value) && value.type === 'step' && Array.isArray(value.metadata.steps)
}
