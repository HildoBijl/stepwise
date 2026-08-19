import type { PlainDataObject } from '@step-wise/js-utils'
import type { SkillId, SkillSetup, SkillSetupLike } from '@step-wise/skill-setup'

/*
 * Basic building blocks
 */

// Exercise atoms
export type ExerciseState = PlainDataObject
export type ExerciseAction = PlainDataObject & { type: string }
export type ExerciseProgress = PlainDataObject

// The metaData object
export type ExerciseMetaData = {
	skill?: SkillId,
	setup?: SkillSetup,
	setupInferenceOrder?: number,
	weight?: number,
	repeatAfter?: number,
}

// The generateState function
export type ExerciseGenerator<TState extends ExerciseState = ExerciseState> = (example: boolean) => TState

/*
 * The exercise history (needed as part of the reducer)
 */

// For solo users
export type SoloExerciseHistoryEvent<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress> = {
	action: TAction
	progress: TProgress
}
export type SoloExerciseHistory<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress> = {
	mode: 'solo'
	events: readonly SoloExerciseHistoryEvent<TAction, TProgress>[]
}

// For groups
export type GroupExerciseSubmission<TAction extends ExerciseAction = ExerciseAction> = {
	userId?: string
	action: TAction
}
export type ResolvedGroupExerciseHistoryEvent<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress> = {
	submissions: readonly GroupExerciseSubmission<TAction>[]
	progress: TProgress
}
export type PendingGroupExerciseHistoryEvent<TAction extends ExerciseAction = ExerciseAction> = {
	submissions: readonly GroupExerciseSubmission<TAction>[]
}
export type GroupExerciseHistoryEvent<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress> = ResolvedGroupExerciseHistoryEvent<TAction, TProgress> | PendingGroupExerciseHistoryEvent<TAction>
export type GroupExerciseHistory<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress> = {
	mode: 'group'
	events: readonly GroupExerciseHistoryEvent<TAction, TProgress>[]
}

// Joint type for solo users and groups
export type ExerciseHistory<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress> = SoloExerciseHistory<TAction, TProgress> | GroupExerciseHistory<TAction, TProgress>

/*
 * The processAction reducer
 */

export type UpdateSkills = (setup: SkillSetupLike, correct: boolean, userId?: string) => void
type ExerciseReducerGeneralInput<TAction extends ExerciseAction, TProgress extends ExerciseProgress, TState extends ExerciseState = ExerciseState> = {
	progress: TProgress
	state: TState
	updateSkills?: UpdateSkills
}
export type ExerciseReducerSoloInput<TAction extends ExerciseAction, TProgress extends ExerciseProgress, TState extends ExerciseState = ExerciseState> = ExerciseReducerGeneralInput<TAction, TProgress, TState> & { history: SoloExerciseHistory<TAction, TProgress>, action: TAction }
export type ExerciseReducerGroupInput<TAction extends ExerciseAction, TProgress extends ExerciseProgress, TState extends ExerciseState = ExerciseState> = ExerciseReducerGeneralInput<TAction, TProgress, TState> & { history: GroupExerciseHistory<TAction, TProgress>, submissions: readonly GroupExerciseSubmission<TAction>[] }
export type ExerciseReducerInput<TAction extends ExerciseAction, TProgress extends ExerciseProgress, TState extends ExerciseState = ExerciseState> = ExerciseReducerSoloInput<TAction, TProgress, TState> | ExerciseReducerGroupInput<TAction, TProgress, TState>
export type ExerciseReducer<TAction extends ExerciseAction, TProgress extends ExerciseProgress, TState extends ExerciseState = ExerciseState> = (input: ExerciseReducerInput<TAction, TProgress, TState>) => TProgress

/*
 * The full exercise
 */

// The specifications for new exercises
export type ExerciseSpec<TMetaData extends ExerciseMetaData, TState extends ExerciseState = ExerciseState> = {
	metaData: TMetaData
	generateState: ExerciseGenerator<TState>
}

// The full definition (after the reducer is added in a build step)
export type Exercise<TMetaData extends ExerciseMetaData = ExerciseMetaData, TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress, TState extends ExerciseState = ExerciseState> = ExerciseSpec<TMetaData, TState> & {
	processAction: ExerciseReducer<TAction, TProgress, TState>
}

// A more generic definition used within containers.
export type ExerciseDefinition = Exercise<any, any, any, any>
