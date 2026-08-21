import type { SkillId, SkillSetup, SkillSetupLike } from '@step-wise/skill-setup'

import type { ExerciseAction, ExerciseState, ExerciseParameters } from '../atomTypes'
import type { GroupExerciseHistory, GroupExerciseSubmission, SoloExerciseHistory } from '../modes'

export type ExerciseMetaData = {
	skill?: SkillId,
	setup?: SkillSetup,
	setupInferenceOrder?: number,
	weight?: number,
	repeatAfter?: number,
}

export type ExerciseGenerator<TParameters extends ExerciseParameters = ExerciseParameters> = (example: boolean) => TParameters
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
	submissions: readonly GroupExerciseSubmission<TAction>[]
	history: GroupExerciseHistory<TAction, TState>
}

export type SoloExerciseReducer<TAction extends ExerciseAction, TState extends ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters> = (input: SoloExerciseReducerInput<TAction, TState, TParameters>) => TState
export type GroupExerciseReducer<TAction extends ExerciseAction, TState extends ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters> = (input: GroupExerciseReducerInput<TAction, TState, TParameters>) => TState

export type ExerciseSpec<TMetaData extends ExerciseMetaData, TParameters extends ExerciseParameters = ExerciseParameters> = {
	metaData: TMetaData
	generateParameters?: ExerciseGenerator<TParameters>
}

export type Exercise<TMetaData extends ExerciseMetaData = ExerciseMetaData, TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters> = Omit<ExerciseSpec<TMetaData, TParameters>, 'generateParameters'> & {
	generateParameters: ExerciseGenerator<TParameters>
	processSoloAction?: SoloExerciseReducer<TAction, TState, TParameters>
	processGroupActions?: GroupExerciseReducer<TAction, TState, TParameters>
}

export type ExerciseDefinition = Exercise<any, any, any, any>
