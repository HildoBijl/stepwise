import { Op } from 'sequelize'

import type { UserSkillModel, UserSkillRecord } from './model'

export interface SkillDatabase {
	UserSkill: UserSkillModel
}

export const SKILL_EVENTS = { skillsUpdated: 'SKILLS_UPDATED' } as const

export function getUserSkill(database: SkillDatabase, userId: string, skillId: string): Promise<UserSkillRecord | null> {
	return database.UserSkill.findOne({ where: { userId, skillId } })
}

export function getUserSkills(database: SkillDatabase, userId: string, skillIds?: string[]): Promise<UserSkillRecord[]> {
	return database.UserSkill.findAll({ where: { userId, ...(skillIds ? { skillId: { [Op.in]: skillIds } } : {}) } })
}
