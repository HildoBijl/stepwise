import type { SkillId } from '@step-wise/skill-definition'
import type { ExerciseAction, ExerciseParameters, ExerciseState } from '@step-wise/exercise-definition'

import type { ApiMutationResult, ApiOperationState } from '../types.ts'

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

export type UseStartGroupExerciseResult = ApiMutationResult<() => Promise<void>>
export type UseSubmitGroupActionResult = ApiMutationResult<(action: ExerciseAction) => Promise<void>>
export type UseCancelGroupActionResult = ApiMutationResult<() => Promise<void>>
export type UseResolveGroupEventResult = ApiMutationResult<() => Promise<void>>

export type ActiveGroupExercisesState = ApiOperationState & { exercises: GroupExercise[] | undefined }
