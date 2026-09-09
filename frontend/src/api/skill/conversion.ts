import { fromKeys, fromKeysAndValues } from '@step-wise/js-utils'
import { type SkillLevelData, SkillLevelSet, ensureSkillLevel, getInitialSkillLevel } from '@step-wise/skill-tracking'
import { expandSkillIdsWithDirectPrerequisitesAndLinks, skillTree } from '@step-wise/skill-tree'

import { userAccountDataRecordToData, userRecordToUser, userSharedDataRecordToData } from '../user/conversion.ts'

import type { ExerciseRecord, SkillLevelRecord, SkillWithExerciseHistoryRecord, SkillWithLatestExerciseRecord, UserWithSkillsRecord } from './records.ts'
import type { Exercise, Skill, SkillWithExerciseHistory, UserWithSkills } from './types.ts'

export function exerciseRecordToExercise(record: ExerciseRecord): Exercise {
	return {
		...record,
		startedAt: new Date(record.startedAt),
		history: record.history.map(event => ({ ...event, performedAt: new Date(event.performedAt) })),
	}
}

export function skillWithLatestExerciseRecordToSkill({ exerciseData, ...record }: SkillWithLatestExerciseRecord): Skill {
	return {
		id: record.id,
		userId: record.userId,
		skillId: record.skillId,
		...(exerciseData?.latestExercise ? { latestExercise: exerciseRecordToExercise(exerciseData.latestExercise) } : {}),
	}
}

export function skillWithExerciseHistoryRecordToSkill({ exerciseData, ...record }: SkillWithExerciseHistoryRecord): SkillWithExerciseHistory {
	return {
		id: record.id,
		userId: record.userId,
		skillId: record.skillId,
		exercises: exerciseData?.exercises.map(exerciseRecordToExercise) ?? [],
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
	const validRecords = records.filter(record => !!skillTree[record.skillId])
	const skillLevelsById = fromKeysAndValues(validRecords.map(record => record.skillId), validRecords.map(skillLevelRecordToData))
	const expandedSkillIds = expandSkillIdsWithDirectPrerequisitesAndLinks(validRecords.map(record => record.skillId))
	const storedSkillLevels = fromKeys(expandedSkillIds, skillId => skillLevelsById[skillId] ?? getInitialSkillLevel(new Date(0)))
	return new SkillLevelSet(skillTree, storedSkillLevels)
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
