import type { MonoExercise } from './MonoExercise/index.ts'
import type { StepExercise } from './StepExercise/index.ts'

export type AnyInputExercise = MonoExercise<any, any> | StepExercise<any, any>
