import type { SkillId, SkillSetup, SkillSetupLike } from '@step-wise/skill-setup'

import type { ExerciseAction, ExerciseProgress, ExerciseState } from '../atomTypes'
import type { GroupExerciseHistory, GroupExerciseSubmission, SoloExerciseHistory } from '../modes'

export type ExerciseMetaData = {
	skill?: SkillId,
	setup?: SkillSetup,
	setupInferenceOrder?: number,
	weight?: number,
	repeatAfter?: number,
}

export type ExerciseGenerator<TState extends ExerciseState = ExerciseState> = (example: boolean) => TState
export type UpdateSkills = (setup: SkillSetupLike, correct: boolean, userId?: string) => void

type ExerciseReducerGeneralInput<TProgress extends ExerciseProgress, TState extends ExerciseState = ExerciseState> = {
	progress: TProgress
	state: TState
	updateSkills?: UpdateSkills
}

export type SoloExerciseReducerInput<TAction extends ExerciseAction, TProgress extends ExerciseProgress, TState extends ExerciseState = ExerciseState> = ExerciseReducerGeneralInput<TProgress, TState> & {
	action: TAction
	history: SoloExerciseHistory<TAction, TProgress>
}

export type GroupExerciseReducerInput<TAction extends ExerciseAction, TProgress extends ExerciseProgress, TState extends ExerciseState = ExerciseState> = ExerciseReducerGeneralInput<TProgress, TState> & {
	submissions: readonly GroupExerciseSubmission<TAction>[]
	history: GroupExerciseHistory<TAction, TProgress>
}

export type SoloExerciseReducer<TAction extends ExerciseAction, TProgress extends ExerciseProgress, TState extends ExerciseState = ExerciseState> = (input: SoloExerciseReducerInput<TAction, TProgress, TState>) => TProgress
export type GroupExerciseReducer<TAction extends ExerciseAction, TProgress extends ExerciseProgress, TState extends ExerciseState = ExerciseState> = (input: GroupExerciseReducerInput<TAction, TProgress, TState>) => TProgress

export type ExerciseSpec<TMetaData extends ExerciseMetaData, TState extends ExerciseState = ExerciseState> = {
	metaData: TMetaData
	generateState?: ExerciseGenerator<TState>
}

export type Exercise<TMetaData extends ExerciseMetaData = ExerciseMetaData, TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress, TState extends ExerciseState = ExerciseState> = Omit<ExerciseSpec<TMetaData, TState>, 'generateState'> & {
	generateState: ExerciseGenerator<TState>
	processSoloAction?: SoloExerciseReducer<TAction, TProgress, TState>
	processGroupActions?: GroupExerciseReducer<TAction, TProgress, TState>
}

export type ExerciseDefinition = Exercise<any, any, any, any>
