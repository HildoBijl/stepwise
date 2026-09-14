import type { Awaitable } from '@step-wise/js-utils'
import type { SkillId, SkillSetup, SkillSetupLike } from '@step-wise/skill-setup'

import type { ExerciseAction, ExerciseState, ExerciseParameters, ExerciseReport, SoloExerciseReport, GroupExerciseReport } from '../types.ts'
import type { UserExerciseAction } from '../modes/index.ts'

/*
 * Metadata
 */

export type ExerciseMetadata = {
	skill?: SkillId,
	setup?: SkillSetup,
	setupInferenceOrder?: number,
	weight?: number,
	repeatAfter?: number,
}

export type ResolvedExerciseMetadata<TMetadata extends ExerciseMetadata = ExerciseMetadata> = TMetadata & {
	weight: number
	repeatAfter: number
}

/*
 * Generation.
 */

export type GenerateExerciseParameters<TParameters extends ExerciseParameters = ExerciseParameters> = (example: boolean) => Awaitable<TParameters>
export type GetInitialState<TParameters extends ExerciseParameters = ExerciseParameters, TState extends ExerciseState = ExerciseState> = (parameters: TParameters) => Awaitable<TState>

/*
 * Reducers.
 */

export type UpdateSkills = (setup: SkillSetupLike, correct: boolean, userId?: string) => void

type ExerciseReducerRequiredInput<TState extends ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters> = {
	parameters: TParameters
	state: TState
	updateSkills?: UpdateSkills
}

export type SoloExerciseReducerInput<TAction extends ExerciseAction, TState extends ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters> = ExerciseReducerRequiredInput<TState, TParameters> & {
	action: TAction
}

export type GroupExerciseReducerInput<TAction extends ExerciseAction, TState extends ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters> = ExerciseReducerRequiredInput<TState, TParameters> & {
	actions: readonly UserExerciseAction<TAction>[]
}

export type ExerciseReducerResult<TState extends ExerciseState, TReport extends ExerciseReport = ExerciseReport> = {
	state: TState
	report?: TReport
}

export type SoloExerciseReducer<TAction extends ExerciseAction, TState extends ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters, TReport extends SoloExerciseReport = SoloExerciseReport> = (input: SoloExerciseReducerInput<TAction, TState, TParameters>) => Awaitable<ExerciseReducerResult<TState, TReport>>

export type GroupExerciseReducer<TAction extends ExerciseAction, TState extends ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters, TReport extends GroupExerciseReport = GroupExerciseReport> = (input: GroupExerciseReducerInput<TAction, TState, TParameters>) => Awaitable<ExerciseReducerResult<TState, TReport>>

/*
 * Exercise.
 */

export type Exercise<TMetadata extends ExerciseMetadata = ExerciseMetadata, TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters, TSoloReport extends SoloExerciseReport = SoloExerciseReport, TGroupReport extends GroupExerciseReport = GroupExerciseReport> = {
	metadata: TMetadata
	generateParameters: GenerateExerciseParameters<TParameters>
	getInitialState: GetInitialState<TParameters, TState>
	processSoloAction?: SoloExerciseReducer<TAction, TState, TParameters, TSoloReport>
	processGroupActions?: GroupExerciseReducer<TAction, TState, TParameters, TGroupReport>
}

export type AnyExercise = Exercise<any, any, any, any, any, any>
