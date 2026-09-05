import type { BernsteinCoefficients } from '@step-wise/bernstein-polynomials'
import type { ExerciseAction, ExerciseParameters, ExerciseState } from '@step-wise/exercise-definition'
import type { SkillId } from '@step-wise/skill-definition'

import type { UserAccountDataRecord, UserRecord, UserSharedDataRecord } from '../user/records.ts'

export type ExerciseEventRecord = {
	id: string
	action: ExerciseAction
	state: ExerciseState
	performedAt: string
}

export type ExerciseRecord = {
	id: string
	exerciseId: string
	mode: 'solo'
	parameters: ExerciseParameters
	initialState: ExerciseState
	startedAt: string
	active: boolean
	state: ExerciseState
	history: ExerciseEventRecord[]
}

export type SkillIdentityRecord = {
	id: string
	userId: string
	skillId: SkillId
}

export type SkillLevelDataRecord = {
	numPracticed: number
	coefficients: BernsteinCoefficients
	coefficientsOn: string
	highest: BernsteinCoefficients
	highestOn: string
}

export type SkillLevelRecord = SkillIdentityRecord & {
	levelData: SkillLevelDataRecord
}

export type SkillExerciseDataRecord = {
	exercises: ExerciseRecord[]
	activeExercise: ExerciseRecord | null
}

export type SkillWithExercisesRecord = SkillIdentityRecord & {
	exerciseData: SkillExerciseDataRecord | null
}

export type SkillRecord = SkillLevelRecord & {
	exerciseData?: SkillExerciseDataRecord | null
}

export type UserWithSkillsRecord = UserRecord & {
	sharedData: (UserSharedDataRecord & { skills: SkillRecord[] }) | null
	accountData: UserAccountDataRecord | null
}
