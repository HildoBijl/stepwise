import type { ExerciseAction, ExerciseParameters, ExerciseState } from '@step-wise/exercise-definition'
import type { SkillLevelData } from '@step-wise/skill-tracking'

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

export type UserSkill = SkillLevelData & {
	id: string
	userId: string
	createdAt: Date
	updatedAt: Date
	exercises?: Exercise[]
	activeExercise?: Exercise
}

export type UserWithSkills = User & Partial<Omit<UserWithSharedData & UserWithAccountData, keyof User>> & {
	skills: UserSkill[]
}
