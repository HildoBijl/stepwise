import { isMonoExercise } from './MonoExercise'
import { isStepExercise } from './StepExercise'
import type { AnyInputExercise } from './types'

export function isInputExercise(value: unknown): value is AnyInputExercise {
	return isMonoExercise(value) || isStepExercise(value)
}
