import { type MonoExercise, isMonoExercise } from './MonoExercise/index.ts'
import { type StepExercise, isStepExercise } from './StepExercise/index.ts'

export type AnyInputExercise = MonoExercise<any, any, any> | StepExercise<any, any, any>

export function isInputExercise(value: unknown): value is AnyInputExercise {
	return isMonoExercise(value) || isStepExercise(value)
}
