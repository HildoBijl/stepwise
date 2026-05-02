import type { SkillId, SkillSetup, SkillSetupLike } from '@step-wise/skill-setup'

// Exercise atoms
export type ExerciseState = Record<string, unknown>
export type ExerciseAction = { type: string, [key: string]: unknown }
export type ExerciseProgress = Record<string, never> | Record<string, unknown>

// Exercise history
export type SingleUserExerciseHistoryEvent<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress> = {
	action: TAction
	progress: TProgress
}
export type GroupExerciseSubmission<TAction extends ExerciseAction = ExerciseAction> = {
	userId?: string
	action: TAction
}
export type GroupExerciseHistoryEvent<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress> = {
	submissions: GroupExerciseSubmission<TAction>[]
	progress?: TProgress
}
export type ExerciseHistoryEvent<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress> = SingleUserExerciseHistoryEvent<TAction, TProgress> | GroupExerciseHistoryEvent<TAction, TProgress>
export type ExerciseHistory<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress> = ExerciseHistoryEvent<TAction, TProgress>[]

// Exercise parameters
export type ExerciseMetaData = { skill?: SkillId, setup?: SkillSetup }
export type ExerciseGenerator<TState extends ExerciseState = ExerciseState> = () => TState

// Exercise reducer
export type UpdateSkills = (setup: SkillSetupLike, correct: boolean, userId?: string) => void
type ExerciseReducerGeneralInput<TAction extends ExerciseAction, TProgress extends ExerciseProgress, TState extends ExerciseState = ExerciseState> = {
	progress: TProgress
	state: TState
	history: ExerciseHistory<TAction, TProgress>
	updateSkills: UpdateSkills
}
export type ExerciseReducerUserInput<TAction extends ExerciseAction, TProgress extends ExerciseProgress, TState extends ExerciseState = ExerciseState> = ExerciseReducerGeneralInput<TAction, TProgress, TState> & { action: TAction }
export type ExerciseReducerGroupInput<TAction extends ExerciseAction, TProgress extends ExerciseProgress, TState extends ExerciseState = ExerciseState> = ExerciseReducerGeneralInput<TAction, TProgress, TState> & { submissions: GroupExerciseSubmission<TAction>[] }
export type ExerciseReducerInput<TAction extends ExerciseAction, TProgress extends ExerciseProgress, TState extends ExerciseState = ExerciseState> = ExerciseReducerUserInput<TAction, TProgress, TState> | ExerciseReducerGroupInput<TAction, TProgress, TState>
export type ExerciseReducer<TAction extends ExerciseAction, TProgress extends ExerciseProgress, TState extends ExerciseState = ExerciseState> = (input: ExerciseReducerInput<TAction, TProgress, TState>) => TProgress

// Exercise
export type Exercise<TMetaData extends ExerciseMetaData, TAction extends ExerciseAction, TProgress extends ExerciseProgress, TState extends ExerciseState = ExerciseState> = {
	metaData: TMetaData
	generateState: ExerciseGenerator<TState>
	processAction: ExerciseReducer<TAction, TProgress, TState>
}
