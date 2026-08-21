import DataLoader from 'dataloader'
import { Op } from 'sequelize'
import { getSkillIdsWithDirectPrerequisitesAndLinks } from '@step-wise/skill-tree'

import type { ApiContext, ApiLoaders } from '../types.ts'
import { dbCourseToCourseDefinition } from '../course/index.ts'

import type { UserSkillRecord } from './model.ts'
import type { SkillDatabase } from './service.ts'

interface SkillPermission {
	withExercises: string[]
	withoutExercises: string[]
}

export function createSkillLoaders(context: ApiContext, { coursesWithStudent }: ApiLoaders): ApiLoaders {
	const db = context.db as SkillDatabase
	return {
		permittedSkillsForStudent: new DataLoader<string, SkillPermission>(async studentIds => {
			const coursesPerStudent = await coursesWithStudent.loadMany(studentIds)
			const courseSkills: Record<string, string[]> = {}
			const courseSkillsWithLinks: Record<string, string[]> = {}
			return coursesPerStudent.map((courses: any[]) => {
				const withExercises = new Set<string>()
				const withoutExercises = new Set<string>()
				courses.forEach(course => {
					if (!courseSkills[course.id]) {
						const courseDefinition = dbCourseToCourseDefinition(course)
						courseSkills[course.id] = [...courseDefinition.allSkills]
						courseSkillsWithLinks[course.id] = [...getSkillIdsWithDirectPrerequisitesAndLinks(courseSkills[course.id])]
					}
					courseSkills[course.id].forEach(skillId => withExercises.add(skillId))
					courseSkillsWithLinks[course.id].forEach(skillId => withoutExercises.add(skillId))
				})
				return { withExercises: [...withExercises], withoutExercises: [...withoutExercises] }
			})
		}),
		allSkillsForUser: new DataLoader<string, UserSkillRecord[]>(async userIds => {
			const skills = await db.UserSkill.findAll({ where: { userId: { [Op.in]: userIds } } })
			const skillsPerUser: Record<string, UserSkillRecord[]> = {}
			skills.forEach(skill => {
				if (!skillsPerUser[skill.userId]) skillsPerUser[skill.userId] = []
				skillsPerUser[skill.userId].push(skill)
			})
			return userIds.map(userId => skillsPerUser[userId] ?? [])
		}),
		skillForUser: new DataLoader<{ userId: string; skillId: string }, UserSkillRecord | null>(async combinations => {
			const skills = await db.UserSkill.findAll({ where: { [Op.or]: [...combinations] } })
			const skillsPerUser: Record<string, Record<string, UserSkillRecord>> = {}
			skills.forEach(skill => {
				if (!skillsPerUser[skill.userId]) skillsPerUser[skill.userId] = {}
				skillsPerUser[skill.userId][skill.skillId] = skill
			})
			return combinations.map(({ userId, skillId }) => skillsPerUser[userId]?.[skillId] ?? null)
		}),
	}
}
