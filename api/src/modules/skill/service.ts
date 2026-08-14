import { Op } from 'sequelize'

import type { UserDatabase } from '../user'

import type { UserSkillModel, UserSkillRecord } from './model'

export interface SkillDatabase extends UserDatabase {
	UserSkill: UserSkillModel
}

export const skillEvents = { skillsUpdated: 'SKILLS_UPDATED' } as const

export function getUserSkills(database: SkillDatabase, userId: string, skillIds?: string[]): Promise<UserSkillRecord[]> {
	return database.UserSkill.findAll({ where: { userId, ...(skillIds ? { skillId: { [Op.in]: skillIds } } : {}) } })
}
