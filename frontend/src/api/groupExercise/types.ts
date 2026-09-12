import type { ExerciseAction, ExerciseState, GroupExerciseHistoryEvent, GroupExerciseInstance, UserExerciseAction } from '@step-wise/exercise-definition'
import type { SkillId } from '@step-wise/skill-definition'

import type { ApiMutationResult, ApiQueryResult } from '../types.ts'

export type GroupExerciseAction = UserExerciseAction & {
	id: string
	performedAt: Date
}

export type GroupExerciseEvent = GroupExerciseHistoryEvent & {
	id: string
	performedAt: Date
	actions: GroupExerciseAction[]
}

export type GroupExercise = Omit<GroupExerciseInstance, 'history'> & {
	id: string
	skillId: SkillId
	exerciseId: string
	active: boolean
	startedAt: Date
	state?: ExerciseState
	history: GroupExerciseEvent[]
}

export type UseStartGroupExerciseResult = ApiMutationResult<() => Promise<void>>
export type UseSubmitGroupActionResult = ApiMutationResult<(action: ExerciseAction) => Promise<void>>
export type UseCancelGroupActionResult = ApiMutationResult<() => Promise<void>>
export type UseResolveGroupEventResult = ApiMutationResult<() => Promise<void>>

export type UseLatestGroupExerciseResult = ApiQueryResult<'exercise', GroupExercise>
export type UseGroupExerciseResult = ApiQueryResult<'exercise', GroupExercise>
