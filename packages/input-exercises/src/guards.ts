import { isMonoExercise } from './MonoExercise/index.ts'
import { isStepExercise } from './StepExercise/index.ts'
import type { AnyInputExercise } from './types.ts'

export function isInputExercise(value: unknown): value is AnyInputExercise {
	return isMonoExercise(value) || isStepExercise(value)
}
