import { fromKeys, fromKeysAndValues } from '@step-wise/js-utils'
import { type SkillLevelData, SkillLevelSet, ensureSkillLevel, getInitialSkillLevel } from '@step-wise/skill-tracking'
import { expandSkillIdsWithDirectPrerequisitesAndLinks, skillTree } from '@step-wise/skill-tree'

import { userAccountDataRecordToData, userRecordToUser, userSharedDataRecordToData } from '../user/conversion.ts'

import type { Exercise, Skill, UserWithSkillActivity, UserWithSkills } from './types.ts'
import type { ExerciseRecord, SkillIdentityRecord, SkillLevelRecord, SkillRecord, UserWithSkillActivityRecord, UserWithSkillsRecord } from './records.ts'

export function exerciseRecordToExercise(record: ExerciseRecord): Exercise {
	return {
		...record,
		startedAt: new Date(record.startedAt),
		history: record.history.map(event => ({ ...event, performedAt: new Date(event.performedAt) })),
	}
}

export function skillRecordToSkill({ exerciseData, ...record }: SkillIdentityRecord & Pick<SkillRecord, 'exerciseData'>): Skill {
	return {
		id: record.id,
		userId: record.userId,
		skillId: record.skillId,
		...(exerciseData ? {
			exercises: exerciseData.exercises.map(exerciseRecordToExercise),
			...(exerciseData.activeExercise ? { activeExercise: exerciseRecordToExercise(exerciseData.activeExercise) } : {}),
		} : {}),
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
		skills: sharedData?.skills.map(skillRecordToSkill) ?? [],
		skillLevelSet: skillLevelRecordsToSet(sharedData?.skills ?? []),
	}
}

export function userWithSkillActivityRecordToUser({ sharedData, accountData, ...record }: UserWithSkillActivityRecord): UserWithSkillActivity {
	return {
		...userRecordToUser(record),
		...userSharedDataRecordToData(sharedData),
		...userAccountDataRecordToData(accountData),
		skillActivities: sharedData.skills.map(({ skillId, levelData }) => ({ skillId, lastPracticedAt: new Date(levelData.coefficientsOn) })),
	}
}
