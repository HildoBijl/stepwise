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

export type GenerateExerciseParametersInput<TContext = undefined> = {
	example: boolean
	context: TContext
}

export type GenerateExerciseParameters<TParameters extends ExerciseParameters = ExerciseParameters, TContext = undefined> = (input: GenerateExerciseParametersInput<TContext>) => Awaitable<TParameters>

export type GetInitialStateInput<TParameters extends ExerciseParameters = ExerciseParameters, TContext = undefined> = {
	parameters: TParameters
	context: TContext
}

export type GetInitialState<TParameters extends ExerciseParameters = ExerciseParameters, TState extends ExerciseState = ExerciseState, TContext = undefined> = (input: GetInitialStateInput<TParameters, TContext>) => Awaitable<TState>

/*
 * Reducers.
 */

export type UpdateSkills = (setup: SkillSetupLike, correct: boolean, userId?: string) => void

type ExerciseReducerRequiredInput<TState extends ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters, TContext = undefined> = {
	parameters: TParameters
	state: TState
	context: TContext
	updateSkills?: UpdateSkills
}

export type SoloExerciseReducerInput<TAction extends ExerciseAction, TState extends ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters, TContext = undefined> = ExerciseReducerRequiredInput<TState, TParameters, TContext> & {
	action: TAction
}

export type GroupExerciseReducerInput<TAction extends ExerciseAction, TState extends ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters, TContext = undefined> = ExerciseReducerRequiredInput<TState, TParameters, TContext> & {
	actions: readonly UserExerciseAction<TAction>[]
}

export type ExerciseReducerResult<TState extends ExerciseState, TReport extends ExerciseReport = ExerciseReport> = {
	state: TState
	report?: TReport
}

export type SoloExerciseReducer<TAction extends ExerciseAction, TState extends ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters, TReport extends SoloExerciseReport = SoloExerciseReport, TContext = undefined> = (input: SoloExerciseReducerInput<TAction, TState, TParameters, TContext>) => Awaitable<ExerciseReducerResult<TState, TReport>>

export type GroupExerciseReducer<TAction extends ExerciseAction, TState extends ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters, TReport extends GroupExerciseReport = GroupExerciseReport, TContext = undefined> = (input: GroupExerciseReducerInput<TAction, TState, TParameters, TContext>) => Awaitable<ExerciseReducerResult<TState, TReport>>

/*
 * Exercise.
 */

export type Exercise<TMetadata extends ExerciseMetadata = ExerciseMetadata, TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters, TSoloReport extends SoloExerciseReport = SoloExerciseReport, TGroupReport extends GroupExerciseReport = GroupExerciseReport, TContext = undefined> = {
	metadata: TMetadata
	generateParameters: GenerateExerciseParameters<TParameters, TContext>
	getInitialState: GetInitialState<TParameters, TState, TContext>
	processSoloAction?: SoloExerciseReducer<TAction, TState, TParameters, TSoloReport, TContext>
	processGroupActions?: GroupExerciseReducer<TAction, TState, TParameters, TGroupReport, TContext>
}

export type AnyExercise = Exercise<any, any, any, any, any, any, any>
