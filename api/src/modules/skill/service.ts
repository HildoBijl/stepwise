import { Op } from 'sequelize'

import type { SkillId } from '@step-wise/skill-definition'

import type { UserDatabase } from '../user/index.ts'

import type { UserSkillModel, UserSkillRecord } from './model.ts'

export interface SkillDatabase extends UserDatabase {
	UserSkill: UserSkillModel
}

export const skillEvents = { skillsUpdated: 'SKILLS_UPDATED' } as const

export function getUserSkills(database: SkillDatabase, userId: string, skillIds?: readonly SkillId[]): Promise<UserSkillRecord[]> {
	return database.UserSkill.findAll({ where: { userId, ...(skillIds ? { skillId: { [Op.in]: skillIds } } : {}) } })
}
