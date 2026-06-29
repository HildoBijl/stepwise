import type { SkillId, SkillSetup, SkillSetupLike } from '@step-wise/skill-setup'

/*
 * Basic building blocks
 */

// Exercise atoms
export type ExerciseState = Record<string, unknown>
export type ExerciseAction = { type: string, [key: string]: unknown }
export type ExerciseProgress = Record<string, unknown>

// The metaData object
export type ExerciseMetaData = {
	skill?: SkillId,
	setup?: SkillSetup,
	setupInferenceOrder?: number,
	weight?: number,
	repeatAfter?: number,
}

// The generateState function
export type ExerciseGenerator<TState extends ExerciseState = ExerciseState> = () => TState

/*
 * The exercise history (needed as part of the reducer)
 */

// For single users
export type SingleUserExerciseHistoryEvent<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress> = {
	action: TAction
	progress: TProgress
}
export type SingleUserExerciseHistory<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress> = SingleUserExerciseHistoryEvent<TAction, TProgress>[]

// For groups
export type GroupExerciseSubmission<TAction extends ExerciseAction = ExerciseAction> = {
	userId?: string
	action: TAction
}
export type ResolvedGroupExerciseHistoryEvent<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress> = {
	submissions: GroupExerciseSubmission<TAction>[]
	progress: TProgress
}
export type PendingGroupExerciseHistoryEvent<TAction extends ExerciseAction = ExerciseAction> = {
	submissions: GroupExerciseSubmission<TAction>[]
}
export type GroupExerciseHistoryEvent<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress> = ResolvedGroupExerciseHistoryEvent<TAction, TProgress> | PendingGroupExerciseHistoryEvent<TAction>
export type GroupExerciseHistory<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress> = ResolvedGroupExerciseHistoryEvent<TAction, TProgress>[] | [...ResolvedGroupExerciseHistoryEvent<TAction, TProgress>[], PendingGroupExerciseHistoryEvent<TAction>]

// Joint type for single users and groups
export type ExerciseHistory<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress> = SingleUserExerciseHistory<TAction, TProgress> | GroupExerciseHistory<TAction, TProgress>

/*
 * The processAction reducer
 */

export type UpdateSkills = (setup: SkillSetupLike, correct: boolean, userId?: string) => void
type ExerciseReducerGeneralInput<TAction extends ExerciseAction, TProgress extends ExerciseProgress, TState extends ExerciseState = ExerciseState> = {
	progress: TProgress
	state: TState
	history: ExerciseHistory<TAction, TProgress>
	updateSkills?: UpdateSkills
}
export type ExerciseReducerSingleUserInput<TAction extends ExerciseAction, TProgress extends ExerciseProgress, TState extends ExerciseState = ExerciseState> = ExerciseReducerGeneralInput<TAction, TProgress, TState> & { action: TAction }
export type ExerciseReducerGroupInput<TAction extends ExerciseAction, TProgress extends ExerciseProgress, TState extends ExerciseState = ExerciseState> = ExerciseReducerGeneralInput<TAction, TProgress, TState> & { submissions: GroupExerciseSubmission<TAction>[] }
export type ExerciseReducerInput<TAction extends ExerciseAction, TProgress extends ExerciseProgress, TState extends ExerciseState = ExerciseState> = ExerciseReducerSingleUserInput<TAction, TProgress, TState> | ExerciseReducerGroupInput<TAction, TProgress, TState>
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
export type Exercise<TMetaData extends ExerciseMetaData, TAction extends ExerciseAction, TProgress extends ExerciseProgress, TState extends ExerciseState = ExerciseState> = ExerciseSpec<TMetaData, TState> & {
	processAction: ExerciseReducer<TAction, TProgress, TState>
}
