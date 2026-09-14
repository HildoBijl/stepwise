import type { PlainDataObject } from '@step-wise/js-utils'

export type ExerciseParameters = PlainDataObject
export type ExerciseAction = PlainDataObject & { type: string }
export type ExerciseState = PlainDataObject
export type ExerciseReport = PlainDataObject
export type SoloExerciseReport = ExerciseReport
export type GroupExerciseReport = ExerciseReport
