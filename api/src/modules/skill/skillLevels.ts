import type { Transaction } from 'sequelize'

import { ensureBoolean, fromKeysAndValues, fromKeys, mapValues, union } from '@step-wise/js-utils'
import { type SkillSetupLike, ensureSetup } from '@step-wise/skill-setup'
import type { SkillId } from '@step-wise/skill-definition'
import { type SkillObservation, SkillLevelSet, ensureSkillLevel, getInitialSkillLevel } from '@step-wise/skill-tracking'
import { ensureSkillIds, expandSkillIdsWithDirectPrerequisitesAndLinks, skillTree } from '@step-wise/skill-tree'

import type { UserSkillRecord } from './model.ts'
import { type SkillDatabase, getUserSkills } from './service.ts'

export interface SkillUpdate {
	setup: SkillSetupLike
	correct: boolean
}

export interface UserSkillUpdate extends SkillUpdate {
	userId: string
}

export async function getUserSkillLevelSet(database: SkillDatabase, userId: string, skillIds: readonly SkillId[]): Promise<SkillLevelSet> {
	const allSkillIds = [...expandSkillIdsWithDirectPrerequisitesAndLinks(skillIds)]
	const storedSkills = await getUserSkills(database, userId, allSkillIds)
	const skillsAsObject = fromKeysAndValues(storedSkills.map(skill => skill.skillId), storedSkills.map(skill => ensureSkillLevel(skill.get({ plain: true }))))
	const skills = fromKeys(allSkillIds, skillId => skillsAsObject[skillId] ?? getInitialSkillLevel())
	return new SkillLevelSet(skillTree, skills)
}

export async function applySkillUpdates(database: SkillDatabase, skillUpdates: readonly UserSkillUpdate[], transaction: Transaction): Promise<Record<string, UserSkillRecord[]>> {
	const updatesPerUser: Record<string, UserSkillUpdate[]> = {}
	skillUpdates.forEach(update => {
		const userUpdates = updatesPerUser[update.userId] ??= []
		userUpdates.push(update)
	})
	const userIds = Object.keys(updatesPerUser)
	const result: UserSkillRecord[][] = []
	for (const userId of userIds) {
		const userUpdates = updatesPerUser[userId]
		if (!userUpdates) throw new Error(`Failed to collect skill updates for user "${userId}".`)
		result.push(await applySkillUpdatesForUser(database, userId, userUpdates, transaction))
	}
	return fromKeysAndValues(userIds, result)
}

export async function applySkillUpdatesForUser(database: SkillDatabase, userId: string, skillUpdates: readonly SkillUpdate[], transaction: Transaction): Promise<UserSkillRecord[]> {
	const observations: SkillObservation[] = skillUpdates.map(({ setup, correct }) => ({ setup: ensureSetup(setup), correct: ensureBoolean(correct) }))
	const skillSets = observations.map(({ setup }) => setup.getSkillSet())
	const skillIds = ensureSkillIds([...union(...skillSets)])
	if (skillIds.length === 0) return []

	const skillsToLoad = [...expandSkillIdsWithDirectPrerequisitesAndLinks(skillIds)]
	const skills = await getUserSkills(database, userId, skillsToLoad)
	const skillsAsObject = fromKeysAndValues(skills.map(skill => skill.skillId), skills)
	const skillLevels = mapValues(skillsAsObject, skill => ensureSkillLevel(skill.get({ plain: true })))
	const storedSkillLevelSet = fromKeys(skillsToLoad, skillId => skillLevels[skillId] ?? getInitialSkillLevel())
	const updates = new SkillLevelSet(skillTree, storedSkillLevelSet).applyObservations(observations)

	const result: UserSkillRecord[] = []
	for (const skillId of Object.keys(updates)) {
		const skill = skillsAsObject[skillId]
		const update = updates[skillId]
		if (!update) throw new Error(`Failed to calculate a skill update for skill "${skillId}".`)
		result.push(skill ? await skill.update(update, { transaction }) : await database.UserSkill.create({ userId, skillId, ...update }, { transaction }))
	}
	return result
}
