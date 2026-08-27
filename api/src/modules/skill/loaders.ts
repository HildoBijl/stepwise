import DataLoader from 'dataloader'
import { Op } from 'sequelize'

import type { SkillId } from '@step-wise/skill-definition'
import { expandSkillIdsWithDirectPrerequisitesAndLinks } from '@step-wise/skill-tree'

import type { ApiLoaders, LoaderContext } from '../types.ts'
import { createCourseDefinition } from '../course/index.ts'

import type { UserSkillRecord } from './models.ts'

interface SkillPermission {
	withExercises: SkillId[]
	withoutExercises: SkillId[]
}

export interface SkillLoaders {
	permittedSkillsForStudent: DataLoader<string, SkillPermission>
	allSkillsForUser: DataLoader<string, UserSkillRecord[]>
	skillForUser: DataLoader<{ userId: string; skillId: SkillId }, UserSkillRecord | null>
}

declare module '../types.ts' {
	interface ApiLoaders extends SkillLoaders {}
}

export function createSkillLoaders(context: LoaderContext, { coursesWithStudent }: Partial<ApiLoaders>): SkillLoaders {
	if (!coursesWithStudent) throw new Error('Cannot create skill loaders before course loaders.')
	const { db } = context
	return {
		permittedSkillsForStudent: new DataLoader<string, SkillPermission>(async studentIds => {
			const coursesPerStudent = await coursesWithStudent.loadMany(studentIds)
			const courseSkills: Record<string, SkillId[]> = {}
			const courseSkillsWithLinks: Record<string, SkillId[]> = {}
			return coursesPerStudent.map(courses => {
				if (courses instanceof Error) throw courses
				const withExercises = new Set<string>()
				const withoutExercises = new Set<string>()
				courses.forEach(course => {
					if (!courseSkills[course.id]) {
						const analyzedCourse = createCourseDefinition(course)
						courseSkills[course.id] = [...analyzedCourse.allSkillIds]
						courseSkillsWithLinks[course.id] = [...expandSkillIdsWithDirectPrerequisitesAndLinks(analyzedCourse.allSkillIds)]
					}
					const skills = courseSkills[course.id]
					const skillsWithLinks = courseSkillsWithLinks[course.id]
					if (!skills || !skillsWithLinks) throw new Error(`Failed to analyze skills for course "${course.id}".`)
					skills.forEach(skillId => withExercises.add(skillId))
					skillsWithLinks.forEach(skillId => withoutExercises.add(skillId))
				})
				return { withExercises: [...withExercises], withoutExercises: [...withoutExercises] }
			})
		}),
		allSkillsForUser: new DataLoader<string, UserSkillRecord[]>(async userIds => {
			const skills = await db.UserSkill.findAll({ where: { userId: { [Op.in]: userIds } } })
			const skillsPerUser: Record<string, UserSkillRecord[]> = {}
			skills.forEach(skill => {
				const userSkills = skillsPerUser[skill.userId] ??= []
				userSkills.push(skill)
			})
			return userIds.map(userId => skillsPerUser[userId] ?? [])
		}),
		skillForUser: new DataLoader<{ userId: string; skillId: SkillId }, UserSkillRecord | null>(async combinations => {
			const skills = await db.UserSkill.findAll({ where: { [Op.or]: [...combinations] } })
			const skillsPerUser: Record<string, Record<string, UserSkillRecord>> = {}
			skills.forEach(skill => {
				const userSkills = skillsPerUser[skill.userId] ??= {}
				userSkills[skill.skillId] = skill
			})
			return combinations.map(({ userId, skillId }) => skillsPerUser[userId]?.[skillId] ?? null)
		}),
	}
}
