import type { Transaction } from 'sequelize'

import { ensureBoolean, fromKeysAndValues, fromKeys, mapValues, union } from '@step-wise/js-utils'
import { type SkillSetupLike, ensureSetup } from '@step-wise/skill-setup'
import type { SkillId } from '@step-wise/skill-definition'
import { type SkillObservation, SkillLevelSet, ensureSkillLevel, getInitialSkillLevel } from '@step-wise/skill-tracking'
import { ensureSkillIds, expandSkillIdsWithDirectPrerequisitesAndLinks, skillTree } from '@step-wise/skill-tree'

import type { UserSkillRecord } from './models.ts'
import { type SkillDatabase, getUserSkills } from './service.ts'

export interface SkillObservationInput {
	setup: SkillSetupLike
	correct: boolean
}

export interface UserSkillObservationInput extends SkillObservationInput {
	userId: string
}

export async function getUserSkillLevelSet(db: SkillDatabase, userId: string, skillIds: readonly SkillId[]): Promise<SkillLevelSet> {
	const allSkillIds = [...expandSkillIdsWithDirectPrerequisitesAndLinks(skillIds)]
	const storedSkills = await getUserSkills(db, userId, { skillIds: allSkillIds })
	const skillsAsObject = fromKeysAndValues(storedSkills.map(skill => skill.skillId), storedSkills.map(skill => ensureSkillLevel(skill.get({ plain: true }))))
	const skills = fromKeys(allSkillIds, skillId => skillsAsObject[skillId] ?? getInitialSkillLevel())
	return new SkillLevelSet(skillTree, skills)
}

export async function applySkillObservations(db: SkillDatabase, observations: readonly UserSkillObservationInput[], transaction: Transaction): Promise<Record<string, UserSkillRecord[]>> {
	const observationsPerUser: Record<string, UserSkillObservationInput[]> = {}
	observations.forEach(observation => {
		const userObservations = observationsPerUser[observation.userId] ??= []
		userObservations.push(observation)
	})
	const userIds = Object.keys(observationsPerUser)
	const result: UserSkillRecord[][] = []
	for (const userId of userIds) {
		const userObservations = observationsPerUser[userId]
		if (!userObservations) throw new Error(`Failed to collect skill observations for user "${userId}".`)
		result.push(await applySkillObservationsForUser(db, userId, userObservations, transaction))
	}
	return fromKeysAndValues(userIds, result)
}

export async function applySkillObservationsForUser(db: SkillDatabase, userId: string, observationInputs: readonly SkillObservationInput[], transaction: Transaction): Promise<UserSkillRecord[]> {
	const observations: SkillObservation[] = observationInputs.map(({ setup, correct }) => ({ setup: ensureSetup(setup), correct: ensureBoolean(correct) }))
	const skillSets = observations.map(({ setup }) => setup.getSkillSet())
	const skillIds = ensureSkillIds([...union(...skillSets)])
	if (skillIds.length === 0) return []

	const skillsToLoad = [...expandSkillIdsWithDirectPrerequisitesAndLinks(skillIds)]
	const skills = await getUserSkills(db, userId, { skillIds: skillsToLoad })
	const skillsAsObject = fromKeysAndValues(skills.map(skill => skill.skillId), skills)
	const skillLevels = mapValues(skillsAsObject, skill => ensureSkillLevel(skill.get({ plain: true })))
	const storedSkillLevelSet = fromKeys(skillsToLoad, skillId => skillLevels[skillId] ?? getInitialSkillLevel())
	const updates = new SkillLevelSet(skillTree, storedSkillLevelSet).applyObservations(observations)

	const result: UserSkillRecord[] = []
	for (const skillId of Object.keys(updates)) {
		const skill = skillsAsObject[skillId]
		const update = updates[skillId]
		if (!update) throw new Error(`Failed to calculate a skill update for skill "${skillId}".`)
		result.push(skill ? await skill.update(update, { transaction }) : await db.UserSkill.create({ userId, skillId, ...update }, { transaction }))
	}
	return result
}
