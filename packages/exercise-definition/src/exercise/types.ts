import type { SkillId, SkillSetup, SkillSetupLike } from '@step-wise/skill-setup'

import type { ExerciseAction, ExerciseProgress, ExerciseParameters } from '../atomTypes'
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

type ExerciseReducerGeneralInput<TProgress extends ExerciseProgress, TParameters extends ExerciseParameters = ExerciseParameters> = {
	progress: TProgress
	parameters: TParameters
	updateSkills?: UpdateSkills
}

export type SoloExerciseReducerInput<TAction extends ExerciseAction, TProgress extends ExerciseProgress, TParameters extends ExerciseParameters = ExerciseParameters> = ExerciseReducerGeneralInput<TProgress, TParameters> & {
	action: TAction
	history: SoloExerciseHistory<TAction, TProgress>
}

export type GroupExerciseReducerInput<TAction extends ExerciseAction, TProgress extends ExerciseProgress, TParameters extends ExerciseParameters = ExerciseParameters> = ExerciseReducerGeneralInput<TProgress, TParameters> & {
	submissions: readonly GroupExerciseSubmission<TAction>[]
	history: GroupExerciseHistory<TAction, TProgress>
}

export type SoloExerciseReducer<TAction extends ExerciseAction, TProgress extends ExerciseProgress, TParameters extends ExerciseParameters = ExerciseParameters> = (input: SoloExerciseReducerInput<TAction, TProgress, TParameters>) => TProgress
export type GroupExerciseReducer<TAction extends ExerciseAction, TProgress extends ExerciseProgress, TParameters extends ExerciseParameters = ExerciseParameters> = (input: GroupExerciseReducerInput<TAction, TProgress, TParameters>) => TProgress

export type ExerciseSpec<TMetaData extends ExerciseMetaData, TParameters extends ExerciseParameters = ExerciseParameters> = {
	metaData: TMetaData
	generateParameters?: ExerciseGenerator<TParameters>
}

export type Exercise<TMetaData extends ExerciseMetaData = ExerciseMetaData, TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress, TParameters extends ExerciseParameters = ExerciseParameters> = Omit<ExerciseSpec<TMetaData, TParameters>, 'generateParameters'> & {
	generateParameters: ExerciseGenerator<TParameters>
	processSoloAction?: SoloExerciseReducer<TAction, TProgress, TParameters>
	processGroupActions?: GroupExerciseReducer<TAction, TProgress, TParameters>
}

export type ExerciseDefinition = Exercise<any, any, any, any>
