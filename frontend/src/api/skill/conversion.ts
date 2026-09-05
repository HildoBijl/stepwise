import { userAccountDataRecordToData, userRecordToUser, userSharedDataRecordToData } from '../user/conversion.ts'

import type { Exercise, UserSkill, UserWithSkills } from './types.ts'
import type { ExerciseRecord, SkillRecord, UserWithSkillsRecord } from './records.ts'

export function exerciseRecordToExercise(record: ExerciseRecord): Exercise {
	return {
		...record,
		startedAt: new Date(record.startedAt),
		history: record.history.map(event => ({ ...event, performedAt: new Date(event.performedAt) })),
	}
}

export function skillRecordToSkill({ exerciseData, ...record }: SkillRecord): UserSkill {
	return {
		...record,
		coefficientsOn: new Date(record.coefficientsOn),
		highestOn: new Date(record.highestOn),
		createdAt: new Date(record.createdAt),
		updatedAt: new Date(record.updatedAt),
		...(exerciseData ? {
			exercises: exerciseData.exercises.map(exerciseRecordToExercise),
			...(exerciseData.activeExercise ? { activeExercise: exerciseRecordToExercise(exerciseData.activeExercise) } : {}),
		} : {}),
	}
}

export function userWithSkillsRecordToUser({ sharedData, accountData, ...user }: UserWithSkillsRecord): UserWithSkills {
	return {
		...userRecordToUser(user),
		...(sharedData ? userSharedDataRecordToData(sharedData) : {}),
		...(accountData ? userAccountDataRecordToData(accountData) : {}),
		skills: sharedData?.skills.map(skillRecordToSkill) ?? [],
	}
}
