import type { SkillSetupLike } from '@step-wise/skill-setup'
import type { ExerciseState } from '@step-wise/exercise-definition'

import type { CheckInputData, InputExerciseAction, InputExerciseMetaData, InputExercise, InputExerciseSpec, Solution } from '../InputExercise'

// Add exercise steps and substeps to meta data.
export type StepExerciseStep = SkillSetupLike | null
export type StepExerciseSubSteps = StepExerciseStep[]
export type StepExerciseSteps = (StepExerciseStep | StepExerciseSubSteps)[]
export type StepExerciseMetaData = InputExerciseMetaData & { steps: StepExerciseSteps }

// Update the progress to allow for steps and substeps.
export type StepId = `${number}`
export type SubStepId = `${number}`
export type StepExerciseSubStepProgress = true
export type StepExerciseStepProgress = { [subStepId: SubStepId]: StepExerciseSubStepProgress } & Partial<{ solved: true, givenUp: true, done: true }>
export type StepExerciseSplitProgress = { split: true, step: number, done?: true } & { [stepId: StepId]: StepExerciseStepProgress }
export type StepExerciseProgress = Record<string, never> | { solved: true, done: true } | StepExerciseSplitProgress

// Extend the CheckInput function to include steps and substeps.
export type StepExerciseCheckInput<TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution> = (data: CheckInputData<StepExerciseMetaData, TState, TSolution>, step: number, substep?: number) => boolean

// Author-facing definition before processAction is added.
export type StepExerciseSpec<TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution> =
	InputExerciseSpec<StepExerciseMetaData, TState, TSolution> &
	{ checkInput: StepExerciseCheckInput<TState, TSolution> }

// Runtime exercise after processAction is added.
export type StepExercise<TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution> =
	InputExercise<StepExerciseMetaData, InputExerciseAction, StepExerciseProgress, TState, TSolution> &
	StepExerciseSpec<TState, TSolution> &
	{ type: 'step' }
