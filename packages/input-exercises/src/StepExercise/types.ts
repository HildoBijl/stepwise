import type { SkillSetupLike } from '@step-wise/skill-setup'

import type { CheckInputData, InputExerciseAction, InputExerciseMetaData, InputExerciseParameters, InputExercise, InputExerciseSpec, Solution } from '../InputExercise'

// Add exercise steps and substeps to meta data.
export type StepExerciseStep = SkillSetupLike | undefined
export type StepExerciseSubSteps = StepExerciseStep[]
export type StepExerciseSteps = (StepExerciseStep | StepExerciseSubSteps)[]
export type StepExerciseMetaData = InputExerciseMetaData & { steps: StepExerciseSteps }

// Update the state to allow for steps and substeps.
export type StepId = `${number}`
export type SubStepId = `${number}`
export type StepExerciseSubStepState = true
export type StepExerciseStepState = { [subStepId: SubStepId]: StepExerciseSubStepState } & Partial<{ solved: true, givenUp: true, done: true }>
export type StepExerciseSplitState = { split: true, step: number, done?: true } & { [stepId: StepId]: StepExerciseStepState }
export type StepExerciseState = Record<string, never> | { solved: true, done: true } | StepExerciseSplitState

// Extend the CheckInput function to include steps and substeps.
export type StepExerciseCheckInput<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution> = (data: CheckInputData<StepExerciseMetaData, TParameters, TSolution>, step: number, substep?: number) => boolean

// Author-facing definition before the mode-specific reducers are added.
export type StepExerciseSpec<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution> = InputExerciseSpec<StepExerciseMetaData, TParameters, TSolution> & { checkInput: StepExerciseCheckInput<TParameters, TSolution> }

// Runtime exercise after the mode-specific reducers are added.
export type StepExercise<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution> = InputExercise<StepExerciseMetaData, InputExerciseAction, StepExerciseState, TParameters, TSolution> & Omit<StepExerciseSpec<TParameters, TSolution>, 'generateParameters'> & { type: 'step' }
