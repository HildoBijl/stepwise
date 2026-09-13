import type { Awaitable } from '@step-wise/js-utils'
import type { SkillSetupLike } from '@step-wise/skill-setup'

import type { CheckInputData, InputDependency, InputExerciseAction, InputExerciseAttemptState, InputExerciseDependencyState, InputExerciseMetadata, InputExerciseParameters, InputExercise, InputExerciseSpec, InputExerciseSolution } from '../InputExercise/index.ts'

// Add exercise steps and substeps to meta data.
export type StepExerciseStep = SkillSetupLike | undefined
export type StepExerciseSubsteps = StepExerciseStep[]
export type StepExerciseSteps = (StepExerciseStep | StepExerciseSubsteps)[]
export type StepExerciseMetadata = InputExerciseMetadata & { steps: StepExerciseSteps }

// Update the state to allow for steps and substeps.
export type StepId = `${number}`
export type SubstepId = `${number}`
export type StepExerciseSubstepState = true
export type StepExerciseStepState = InputExerciseAttemptState & { [subStepId: SubstepId]: StepExerciseSubstepState } & Partial<{ solved: true, givenUp: true, done: true }>
export type StepExerciseSplitState = InputExerciseAttemptState & InputExerciseDependencyState & { split: true, step: number, done?: true } & { [stepId: StepId]: StepExerciseStepState }
export type StepExerciseState = (InputExerciseAttemptState & InputExerciseDependencyState & Partial<{ solved: true, done: true }>) | StepExerciseSplitState

// Extend the CheckInput function to include steps and substeps.
export type StepExerciseCheckInput<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution> = (data: CheckInputData<StepExerciseMetadata, TParameters, TSolution>, step: number, substep?: number) => Awaitable<boolean>

// Author-facing definition before the mode-specific reducers are added.
export type StepExerciseSpec<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency> = InputExerciseSpec<StepExerciseMetadata, TParameters, TSolution, TInputDependency> & { checkInput: StepExerciseCheckInput<TParameters, TSolution> }

// Runtime exercise after the mode-specific reducers are added.
export type StepExercise<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency> = InputExercise<StepExerciseMetadata, InputExerciseAction, StepExerciseState, TParameters, TSolution, TInputDependency> & Omit<StepExerciseSpec<TParameters, TSolution, TInputDependency>, 'generateParameters' | 'valueTypes'> & { type: 'step' }
