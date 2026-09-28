import type { Awaitable } from '@step-wise/js-utils'
import type { SkillSetupLike } from '@step-wise/skill-setup'
import type { ExerciseMode, GroupExerciseHistory, SoloExerciseHistory } from '@step-wise/exercise-definition'

import type { CheckInputData, CheckInputResult, GroupInputExerciseReport, InputDependency, InputExerciseAction, InputExerciseAttemptState, InputExerciseDependencyState, InputExerciseMetadata, InputExerciseParameters, InputExercise, InputExerciseSpec, InputExerciseSolution, SoloInputExerciseReport } from '../InputExercise/index.ts'

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
export type StepExerciseHistoryByMode = {
	solo: SoloExerciseHistory<InputExerciseAction, StepExerciseState, SoloInputExerciseReport>
	group: GroupExerciseHistory<InputExerciseAction, StepExerciseState, GroupInputExerciseReport>
}
export type StepExerciseHistory = StepExerciseHistoryByMode[ExerciseMode]

// Extend the CheckInput function to include steps and substeps.
export type StepExerciseCheckInput<TParameters extends InputExerciseParameters = InputExerciseParameters, TInputDependency = InputDependency, TSolution extends InputExerciseSolution = InputExerciseSolution, TContext = undefined> = (data: CheckInputData<StepExerciseMetadata, TParameters, TInputDependency, TSolution, TContext>, step: number, substep?: number) => Awaitable<CheckInputResult>

// Author-facing definition before the mode-specific reducers are added.
export type StepExerciseSpec<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency, TContext = undefined> = InputExerciseSpec<StepExerciseMetadata, TParameters, TSolution, TInputDependency, TContext> & { checkInput: StepExerciseCheckInput<TParameters, TInputDependency, TSolution, TContext> }

// Runtime exercise after the mode-specific reducers are added.
export type StepExercise<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency, TContext = undefined> = InputExercise<StepExerciseMetadata, InputExerciseAction, StepExerciseState, TParameters, TSolution, TInputDependency, TContext> & Omit<StepExerciseSpec<TParameters, TSolution, TInputDependency, TContext>, 'generateParameters' | 'valueTypes'> & { type: 'step' }
