import type { MonoExercise } from './MonoExercise'
import type { StepExercise } from './StepExercise'

export type AnyInputExercise = MonoExercise<any, any> | StepExercise<any, any>
