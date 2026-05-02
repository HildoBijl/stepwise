import { type SkillSetupLike } from '@step-wise/skill-setup'

import type { ExerciseState } from '../Exercise'
import type { CheckInputData, InputExerciseAction, InputExerciseMetaData, InputExercise, Solution } from '../InputExercise'
import type { SimpleExerciseProgress } from '../SimpleExercise'

// Add exercise steps and substeps to meta data.
export type StepExerciseStep = SkillSetupLike | null
export type StepExerciseSubSteps = StepExerciseStep[]
export type StepExerciseSteps = (StepExerciseStep | StepExerciseSubSteps)[]
export type StepExerciseMetaData = InputExerciseMetaData & { steps: StepExerciseSteps }

// Update the progress to allow for steps and substeps.
export type StepId = `${number}`
export type SubStepId = `${number}`
export type StepExerciseSubStepProgress = true
export type StepExerciseStepProgress = { [subStepId: SubStepId]: StepExerciseSubStepProgress } & SimpleExerciseProgress
export type StepExerciseSplitProgress = { split: true, step: number, done?: true } & { [stepId: StepId]: StepExerciseStepProgress }
export type StepExerciseProgress = Record<string, never> | { solved: true, done: true }	| StepExerciseSplitProgress

// Extend the CheckInput function to include steps and substeps.
export type StepExerciseCheckInput<TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution> = (data: CheckInputData<TState, StepExerciseMetaData, TSolution>, step: number, substep: number) => boolean

// Assemble into a StepExercise type.
export type StepExercise<TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution> = Omit<InputExercise<StepExerciseMetaData, InputExerciseAction, StepExerciseProgress, TState, TSolution>, 'checkInput'> & { checkInput: StepExerciseCheckInput<TState, TSolution> }
