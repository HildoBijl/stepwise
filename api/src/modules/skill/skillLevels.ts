import type { Transaction } from 'sequelize'
import { SkillLevelSet, ensureSkillLevel, getInitialSkillLevel } from '@step-wise/skill-tracking'
import { ensureSetup, type SkillSetupLike } from '@step-wise/skill-setup'
import { ensureSkillIds, getSkillIdsWithDirectPrerequisitesAndLinks, skillTree } from '@step-wise/skill-tree'
import { ensureBoolean, fromKeysAndValues, fromKeys, mapValues, union } from '@step-wise/js-utils'

import { getUserSkills, type SkillDatabase } from './service.ts'

interface SkillUpdate {
	setup: SkillSetupLike
	correct: unknown
	userId?: string
}

export async function getUserSkillLevelSet(database: SkillDatabase, userId: string, skillIds: string[]) {
	const allSkillIds = [...getSkillIdsWithDirectPrerequisitesAndLinks(skillIds)]
	const rawSkills = await getUserSkills(database, userId, allSkillIds)
	const skillsAsObject = fromKeysAndValues(rawSkills.map(skill => skill.skillId), rawSkills.map(skill => ensureSkillLevel(skill.get({ plain: true }))))
	const skills = fromKeys(allSkillIds, skillId => skillsAsObject[skillId] ?? getInitialSkillLevel())
	return new SkillLevelSet(skillTree, skills)
}

export async function applySkillUpdates(database: SkillDatabase, skillUpdates: SkillUpdate[], transaction: Transaction) {
	const updatesPerUser: Record<string, SkillUpdate[]> = {}
	skillUpdates.forEach(update => {
		if (!update.userId) throw new Error('Cannot apply a skill update without a user ID.')
		if (!updatesPerUser[update.userId]) updatesPerUser[update.userId] = []
		updatesPerUser[update.userId].push(update)
	})
	const userIds = Object.keys(updatesPerUser)
	const result = []
	for (const userId of userIds) result.push(await applySkillUpdatesForUser(database, userId, updatesPerUser[userId], transaction))
	return fromKeysAndValues(userIds, result)
}

export async function applySkillUpdatesForUser(database: SkillDatabase, userId: string, skillUpdates: SkillUpdate[], transaction: Transaction) {
	const observations = skillUpdates.map(({ setup, correct }) => ({ setup: ensureSetup(setup), correct: ensureBoolean(correct) }))
	const skillSets = observations.map(({ setup }) => setup.getSkillSet())
	const skillIds = ensureSkillIds([...union(...skillSets)])
	if (skillIds.length === 0) return []

	const skillsToLoad = [...getSkillIdsWithDirectPrerequisitesAndLinks(skillIds)]
	const skills = await getUserSkills(database, userId, skillsToLoad)
	const skillsAsObject = fromKeysAndValues(skills.map(skill => skill.skillId), skills)
	const skillLevels = mapValues(skillsAsObject, skill => ensureSkillLevel(skill.get({ plain: true })))
	const rawSkillLevelSet = fromKeys(skillsToLoad, skillId => skillLevels[skillId] ?? getInitialSkillLevel())
	const updates = new SkillLevelSet(skillTree, rawSkillLevelSet).processObservations(observations)

	const result = []
	for (const skillId of Object.keys(updates)) {
		const skill = skillsAsObject[skillId]
		result.push(skill ? await skill.update(updates[skillId], { transaction }) : await database.UserSkill.create({ userId, skillId, ...updates[skillId] }, { transaction }))
	}
	return result
}
