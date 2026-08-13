import DataLoader from 'dataloader'
import { Op } from 'sequelize'
import { includeDirectPrerequisitesAndLinks } from '@step-wise/skill-tree'

import { dbCourseToCourseObject } from '../../graphql/util/Course'
import type { ApiContext, ApiLoaders, LoaderFactory } from '../types'
import type { SkillDatabase, UserSkillRecord } from '.'

interface SkillPermission {
	withExercises: string[]
	withoutExercises: string[]
}

export const createSkillLoaders: LoaderFactory = (context: ApiContext, { coursesWithStudent }: ApiLoaders) => {
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
					const courseObject = dbCourseToCourseObject(course)
					courseSkills[course.id] = [...courseObject.allSkills]
					courseSkillsWithLinks[course.id] = [...includeDirectPrerequisitesAndLinks(courseSkills[course.id])]
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
