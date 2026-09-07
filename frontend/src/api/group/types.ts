import type { ExerciseAction, ExerciseParameters, ExerciseState } from '@step-wise/exercise-definition'
import type { SkillId } from '@step-wise/skill-definition'

import type { ApiMutationResult, ApiOperationState, ApiQueryResult } from '../types.ts'

export type GroupMember = {
	groupId: string
	userId: string
	name?: string
	givenName?: string
	familyName?: string
	active: boolean
	lastActivity: Date
}

export type Group = {
	code: string
	members: GroupMember[]
}

export type GroupExerciseAction = {
	id: string
	userId: string
	action: ExerciseAction
	performedAt: Date
}

export type GroupExerciseEvent = {
	id: string
	state?: ExerciseState
	performedAt: Date
	actions: GroupExerciseAction[]
}

export type GroupExercise = {
	id: string
	skillId: SkillId
	exerciseId: string
	mode: 'group'
	parameters: ExerciseParameters
	initialState: ExerciseState
	active: boolean
	startedAt: Date
	state?: ExerciseState
	history: GroupExerciseEvent[]
}

export type UseGroupExistsResult = ApiQueryResult<'exists', boolean>
export type UseMyGroupsResult = ApiQueryResult<'groups', Group[]>

export type UseCreateGroupResult = ApiMutationResult<() => Promise<void>>
export type UseJoinGroupResult = ApiMutationResult<(code: string) => Promise<void>>
export type UseLeaveGroupResult = ApiMutationResult<() => Promise<void>>
export type UseActivateGroupResult = ApiMutationResult<() => Promise<void>>
export type UseDeactivateGroupResult = ApiMutationResult<() => Promise<void>>
export type UseStartGroupExerciseResult = ApiMutationResult<() => Promise<void>>
export type UseSubmitGroupActionResult = ApiMutationResult<(action: ExerciseAction) => Promise<void>>
export type UseCancelGroupActionResult = ApiMutationResult<() => Promise<void>>
export type UseResolveGroupEventResult = ApiMutationResult<() => Promise<void>>

export type ActiveGroupState = ApiOperationState & { group: Group | undefined }
export type ActiveGroupExercisesState = ApiOperationState & { exercises: GroupExercise[] | undefined }
