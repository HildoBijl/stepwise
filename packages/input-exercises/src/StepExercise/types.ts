import type { SkillSetupLike } from '@step-wise/skill-setup'

import type { CheckInputData, InputExerciseAction, InputExerciseAttemptState, InputExerciseMetadata, InputExerciseParameters, InputExercise, InputExerciseSpec, InputExerciseSolution } from '../InputExercise'

// Add exercise steps and substeps to meta data.
export type StepExerciseStep = SkillSetupLike | undefined
export type StepExerciseSubSteps = StepExerciseStep[]
export type StepExerciseSteps = (StepExerciseStep | StepExerciseSubSteps)[]
export type StepExerciseMetadata = InputExerciseMetadata & { steps: StepExerciseSteps }

// Update the state to allow for steps and substeps.
export type StepId = `${number}`
export type SubStepId = `${number}`
export type StepExerciseSubStepState = true
export type StepExerciseStepState = InputExerciseAttemptState & { [subStepId: SubStepId]: StepExerciseSubStepState } & Partial<{ solved: true, givenUp: true, done: true }>
export type StepExerciseSplitState = InputExerciseAttemptState & { split: true, step: number, done?: true } & { [stepId: StepId]: StepExerciseStepState }
export type StepExerciseState = (InputExerciseAttemptState & Partial<{ solved: true, done: true }>) | StepExerciseSplitState

// Extend the CheckInput function to include steps and substeps.
export type StepExerciseCheckInput<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution> = (data: CheckInputData<StepExerciseMetadata, TParameters, TSolution>, step: number, substep?: number) => boolean

// Author-facing definition before the mode-specific reducers are added.
export type StepExerciseSpec<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution> = InputExerciseSpec<StepExerciseMetadata, TParameters, TSolution, StepExerciseState> & { checkInput: StepExerciseCheckInput<TParameters, TSolution> }

// Runtime exercise after the mode-specific reducers are added.
export type StepExercise<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution> = InputExercise<StepExerciseMetadata, InputExerciseAction, StepExerciseState, TParameters, TSolution> & Omit<StepExerciseSpec<TParameters, TSolution>, 'generateParameters' | 'getInitialState'> & { type: 'step' }
