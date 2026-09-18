import type { ExerciseAction, ExerciseState, SoloExerciseEvent as BaseSoloExerciseEvent, SoloExerciseInstance } from '@step-wise/exercise-definition'
import type { SkillId } from '@step-wise/module-tree-definition'
import type { SkillLevelSet } from '@step-wise/skill-tracking'

import type { ApiMutationResult, ApiQueryResult } from '../types.ts'
import type { User, UserWithAccountData, UserWithSharedData } from '../user/types.ts'

export type SoloExerciseEvent = BaseSoloExerciseEvent & {
	id: string
	eventIndex: number
	performedAt: Date
}

export type SoloExercise = Omit<SoloExerciseInstance, 'history'> & {
	id: string
	eventIndex: number
	exerciseId: string
	startedAt: Date
	active: boolean
	state: ExerciseState
	history: SoloExerciseEvent[]
}

type SkillIdentity = {
	id: string
	userId: string
	skillId: SkillId
}

export type Skill = SkillIdentity & {
	latestExercise?: SoloExercise
}

export type SkillWithExerciseHistory = SkillIdentity & {
	exercises: SoloExercise[]
}

export type UseSkillResult = ApiQueryResult<'skill', Skill>

export type UserWithSkills = User & Partial<Omit<UserWithSharedData & UserWithAccountData, keyof User>> & {
	skills: SkillWithExerciseHistory[]
	skillLevelSet: SkillLevelSet
}

export type UseUserWithSkillsResult = ApiQueryResult<'user', UserWithSkills>
export type UseStartExerciseResult = ApiMutationResult<() => Promise<void>>
export type UseSubmitExerciseActionResult = ApiMutationResult<(exerciseId: string, eventIndex: number, action: ExerciseAction) => Promise<void>>
