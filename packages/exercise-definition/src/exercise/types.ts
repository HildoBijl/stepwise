import type { SkillId, SkillSetup, SkillSetupLike } from '@step-wise/skill-setup'

import type { ExerciseAction, ExerciseState, ExerciseParameters } from '../atomTypes'
import type { GroupExerciseHistory, UserExerciseAction, SoloExerciseHistory } from '../modes'

export type ExerciseMetadata = {
	skill?: SkillId,
	setup?: SkillSetup,
	setupInferenceOrder?: number,
	weight?: number,
	repeatAfter?: number,
}

export type GenerateExerciseParameters<TParameters extends ExerciseParameters = ExerciseParameters> = (example: boolean) => TParameters
export type GetInitialState<TParameters extends ExerciseParameters = ExerciseParameters, TState extends ExerciseState = ExerciseState> = (parameters: TParameters) => TState
export type UpdateSkills = (setup: SkillSetupLike, correct: boolean, userId?: string) => void

type ExerciseReducerGeneralInput<TState extends ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters> = {
	state: TState
	parameters: TParameters
	updateSkills?: UpdateSkills
}

export type SoloExerciseReducerInput<TAction extends ExerciseAction, TState extends ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters> = ExerciseReducerGeneralInput<TState, TParameters> & {
	action: TAction
	history: SoloExerciseHistory<TAction, TState>
}

export type GroupExerciseReducerInput<TAction extends ExerciseAction, TState extends ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters> = ExerciseReducerGeneralInput<TState, TParameters> & {
	actions: readonly UserExerciseAction<TAction>[]
	history: GroupExerciseHistory<TAction, TState>
}

export type SoloExerciseReducer<TAction extends ExerciseAction, TState extends ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters> = (input: SoloExerciseReducerInput<TAction, TState, TParameters>) => TState
export type GroupExerciseReducer<TAction extends ExerciseAction, TState extends ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters> = (input: GroupExerciseReducerInput<TAction, TState, TParameters>) => TState

export type ExerciseSpec<TMetadata extends ExerciseMetadata, TParameters extends ExerciseParameters = ExerciseParameters, TState extends ExerciseState = ExerciseState> = {
	metaData: TMetadata
	generateParameters?: GenerateExerciseParameters<TParameters>
	getInitialState?: GetInitialState<TParameters, TState>
}

export type Exercise<TMetadata extends ExerciseMetadata = ExerciseMetadata, TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters> = Omit<ExerciseSpec<TMetadata, TParameters, TState>, 'generateParameters' | 'getInitialState'> & {
	generateParameters: GenerateExerciseParameters<TParameters>
	getInitialState: GetInitialState<TParameters, TState>
	processSoloAction?: SoloExerciseReducer<TAction, TState, TParameters>
	processGroupActions?: GroupExerciseReducer<TAction, TState, TParameters>
}

export type AnyExercise = Exercise<any, any, any, any>
