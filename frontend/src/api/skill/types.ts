import type { ExerciseAction, ExerciseParameters, ExerciseState } from '@step-wise/exercise-definition'
import type { SkillId } from '@step-wise/skill-definition'
import type { SkillLevelSet } from '@step-wise/skill-tracking'

import type { User, UserWithAccountData, UserWithSharedData } from '../user/types.ts'

export type ExerciseEvent = {
	id: string
	action: ExerciseAction
	state: ExerciseState
	performedAt: Date
}

export type Exercise = {
	id: string
	exerciseId: string
	mode: 'solo'
	parameters: ExerciseParameters
	initialState: ExerciseState
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

export type UseSkillResult = {
	skill: Skill | undefined
	loading: boolean
	error: Error | undefined
}

export type UserWithSkills = User & Partial<Omit<UserWithSharedData & UserWithAccountData, keyof User>> & {
	skills: Skill[]
	skillLevelSet: SkillLevelSet
}

export type UseUserWithSkillsResult = {
	user: UserWithSkills | undefined
	loading: boolean
	error: Error | undefined
}
