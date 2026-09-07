import type { ExerciseAction, ExerciseState, SoloExerciseHistoryEvent, SoloExerciseInstance } from '@step-wise/exercise-definition'
import type { SkillId } from '@step-wise/skill-definition'
import type { SkillLevelSet } from '@step-wise/skill-tracking'

import type { ApiMutationResult, ApiQueryResult } from '../types.ts'
import type { User, UserWithAccountData, UserWithSharedData } from '../user/types.ts'

export type ExerciseEvent = SoloExerciseHistoryEvent & {
	id: string
	performedAt: Date
}

export type Exercise = Omit<SoloExerciseInstance, 'history'> & {
	id: string
	exerciseId: string
	startedAt: Date
	active: boolean
	state: ExerciseState
	history: ExerciseEvent[]
}

export type Skill = {
	id: string
	userId: string
	skillId: SkillId
	exercises?: Exercise[]
	activeExercise?: Exercise
}

export type UseSkillResult = ApiQueryResult<'skill', Skill>

export type UserWithSkills = User & Partial<Omit<UserWithSharedData & UserWithAccountData, keyof User>> & {
	skills: Skill[]
	skillLevelSet: SkillLevelSet
}

export type UserSkillActivity = {
	skillId: SkillId
	lastPracticedAt: Date
}

export type UserWithSkillActivity = UserWithAccountData & {
	skillActivities: UserSkillActivity[]
}

export type UseUserWithSkillsResult = ApiQueryResult<'user', UserWithSkills>
export type UseAllUsersWithSkillActivityResult = ApiQueryResult<'users', UserWithSkillActivity[]>
export type UseStartExerciseResult = ApiMutationResult<() => Promise<void>>
export type UseSubmitExerciseActionResult = ApiMutationResult<(action: ExerciseAction) => Promise<void>>
