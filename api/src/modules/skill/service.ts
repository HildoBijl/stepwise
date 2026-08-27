import { Op } from 'sequelize'

import type { SkillId } from '@step-wise/skill-definition'

import type { UserDatabase } from '../user/index.ts'

import type { UserSkillModel, UserSkillRecord } from './model.ts'

export interface SkillDatabase extends UserDatabase {
	UserSkill: UserSkillModel
}

export const skillEvents = { skillsUpdated: 'SKILLS_UPDATED' } as const

export interface GetUserSkillsOptions {
	skillIds?: readonly SkillId[]
}

export function getUserSkills(db: SkillDatabase, userId: string, { skillIds }: GetUserSkillsOptions = {}): Promise<UserSkillRecord[]> {
	return db.UserSkill.findAll({ where: { userId, ...(skillIds ? { skillId: { [Op.in]: skillIds } } : {}) } })
}
