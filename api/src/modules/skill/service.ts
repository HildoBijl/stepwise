import { Op } from 'sequelize'

import type { UserSkillModel, UserSkillRecord } from './model'

export interface SkillDatabase {
	UserSkill: UserSkillModel
}

export const SKILL_EVENTS = { skillsUpdated: 'SKILLS_UPDATED' } as const

export const getUserSkill = (database: SkillDatabase, userId: string, skillId: string): Promise<UserSkillRecord | null> =>
	database.UserSkill.findOne({ where: { userId, skillId } })

export const getUserSkills = (database: SkillDatabase, userId: string, skillIds?: string[]): Promise<UserSkillRecord[]> =>
	database.UserSkill.findAll({ where: { userId, ...(skillIds ? { skillId: { [Op.in]: skillIds } } : {}) } })
