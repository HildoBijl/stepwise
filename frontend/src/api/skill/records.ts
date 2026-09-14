import type { BernsteinCoefficients } from '@step-wise/bernstein-polynomials'
import type { ExerciseAction, ExerciseParameters, ExerciseState } from '@step-wise/exercise-definition'
import type { SkillId } from '@step-wise/module-tree-definition'

import type { UserAccountDataRecord, UserRecord, UserSharedDataRecord } from '../user/records.ts'

export type ExerciseEventRecord = {
	id: string
	eventIndex: number
	action: ExerciseAction
	state: ExerciseState
	performedAt: string
}

export type ExerciseRecord = {
	id: string
	eventIndex: number
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

export type SkillLevelRecordsQueryData = { skills: SkillLevelRecord[] }
export type SkillLevelRecordsQueryVariables = { skillIds: SkillId[] }

export type SkillLatestExerciseDataRecord = {
	latestExercise: ExerciseRecord | null
}

export type SkillExerciseHistoryDataRecord = {
	exercises: ExerciseRecord[]
}

export type SkillWithLatestExerciseRecord = SkillIdentityRecord & {
	exerciseData: SkillLatestExerciseDataRecord | null
}

export type ExerciseUpdateRecord = {
	exerciseId: string
	active: boolean
	event: ExerciseEventRecord
}

export type SkillWithExerciseHistoryRecord = SkillLevelRecord & {
	exerciseData: SkillExerciseHistoryDataRecord | null
}

export type UserWithSkillsRecord = UserRecord & {
	sharedData: (UserSharedDataRecord & { skills: SkillWithExerciseHistoryRecord[] }) | null
	accountData?: UserAccountDataRecord | null
}
