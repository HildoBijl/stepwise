import { fromKeys, fromKeysAndValues } from '@step-wise/js-utils'
import { type SkillLevelData, SkillLevelSet, ensureSkillLevel, getInitialSkillLevel } from '@step-wise/skill-tracking'
import { expandModuleIdsWithDirectPrerequisites, moduleTree } from '@step-wise/module-tree'

import { userAccountDataRecordToData, userRecordToUser, userSharedDataRecordToData } from '../user/conversion.ts'

import type { ExerciseRecord, SkillLevelRecord, SkillWithExerciseHistoryRecord, SkillWithLatestExerciseRecord, UserWithSkillsRecord } from './records.ts'
import type { Skill, SkillWithExerciseHistory, SoloExercise, UserWithSkills } from './types.ts'

export function exerciseRecordToSoloExercise(record: ExerciseRecord): SoloExercise {
	return {
		...record,
		startedAt: new Date(record.startedAt),
		history: record.history.map(({ report, ...event }) => ({ ...event, ...(report === null ? {} : { report }), performedAt: new Date(event.performedAt) })),
	}
}

export function skillWithLatestExerciseRecordToSkill({ exerciseData, ...record }: SkillWithLatestExerciseRecord): Skill {
	return {
		id: record.id,
		userId: record.userId,
		skillId: record.skillId,
		...(exerciseData?.latestExercise ? { latestExercise: exerciseRecordToSoloExercise(exerciseData.latestExercise) } : {}),
	}
}

export function skillWithExerciseHistoryRecordToSkill({ exerciseData, ...record }: SkillWithExerciseHistoryRecord): SkillWithExerciseHistory {
	return {
		id: record.id,
		userId: record.userId,
		skillId: record.skillId,
		exercises: exerciseData?.exercises.map(exerciseRecordToSoloExercise) ?? [],
	}
}

export function skillLevelRecordToData({ skillId, levelData }: SkillLevelRecord): SkillLevelData {
	return {
		skillId,
		...ensureSkillLevel({
			...levelData,
			coefficientsOn: new Date(levelData.coefficientsOn),
			highestOn: new Date(levelData.highestOn),
		}),
	}
}

export function skillLevelRecordsToSet(records: SkillLevelRecord[]): SkillLevelSet {
	const validRecords = records.filter(record => !!moduleTree[record.skillId])
	const skillLevelsById = fromKeysAndValues(validRecords.map(record => record.skillId), validRecords.map(skillLevelRecordToData))
	const expandedSkillIds = expandModuleIdsWithDirectPrerequisites(validRecords.map(record => record.skillId), { includeConcepts: false, includeLinkedSkills: true })
	const storedSkillLevels = fromKeys(expandedSkillIds, skillId => skillLevelsById[skillId] ?? getInitialSkillLevel(new Date(0)))
	return new SkillLevelSet(moduleTree, storedSkillLevels)
}

export function userWithSkillsRecordToUser({ sharedData, accountData, ...user }: UserWithSkillsRecord): UserWithSkills {
	return {
		...userRecordToUser(user),
		...(sharedData ? userSharedDataRecordToData(sharedData) : {}),
		...(accountData ? userAccountDataRecordToData(accountData) : {}),
		skills: sharedData?.skills.map(skillWithExerciseHistoryRecordToSkill) ?? [],
		skillLevelSet: skillLevelRecordsToSet(sharedData?.skills ?? []),
	}
}
