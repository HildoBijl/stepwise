import type { ExerciseAction, ExerciseParameters, ExerciseState, GroupExerciseReport } from '@step-wise/exercise-definition'
import type { SkillId } from '@step-wise/skill-definition'

export type GroupExerciseActionRecord = {
	id: string
	userId: string
	action: ExerciseAction
	performedAt: string
}

export type GroupExerciseEventRecord = {
	id: string
	eventIndex: number
	state: ExerciseState | null
	report: GroupExerciseReport | null
	performedAt: string
	actions: GroupExerciseActionRecord[]
}

export type GroupExerciseRecord = {
	__typename: 'GroupExercise'
	id: string
	eventIndex: number
	skillId: SkillId
	exerciseId: string
	mode: 'group'
	parameters: ExerciseParameters
	initialState: ExerciseState
	active: boolean
	startedAt: string
	state: ExerciseState | null
	history: GroupExerciseEventRecord[]
}

export type LatestGroupExerciseQueryData = { latestGroupExercise: GroupExerciseRecord | null }
export type LatestGroupExerciseQueryVariables = { code: string; skillId: SkillId }

export type GroupExerciseQueryData = { groupExercise: GroupExerciseRecord | null }
export type GroupExerciseQueryVariables = { id: string }

export type GroupActionUpdateRecord = {
	exerciseId: string
	eventIndex: number
	userId: string
	action: GroupExerciseActionRecord | null
}

export type GroupEventResolutionRecord = {
	exerciseId: string
	eventIndex: number
	state: ExerciseState
	report: GroupExerciseReport | null
	active: boolean
	nextEvent: Omit<GroupExerciseEventRecord, 'actions'> | null
}
