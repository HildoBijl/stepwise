import { describe, expect, it } from 'vitest'

import { SkillLevelSet } from '@step-wise/skill-tracking'

import type { CourseRecord, CourseWithStudentSkillsRecord } from './records.ts'
import { courseRecordToCourseInfo, courseWithStudentSkillsRecordToCourseInfo } from './conversion.ts'

const baseRecord: CourseRecord = {
	__typename: 'Course',
	id: 'course-id',
	code: 'COURSE',
	name: 'Course',
	description: null,
	organization: 'test',
	goals: ['goal'],
	goalWeights: null,
	startingPoints: ['start'],
	setup: null,
	blocks: [{ name: 'Block one', goals: ['goal'] }],
	createdAt: '2026-01-01T00:00:00.000Z',
	updatedAt: '2026-01-02T00:00:00.000Z',
	accessData: null,
	teacherData: null,
}

describe('course API conversion', () => {
	it('creates application info and a logical course definition', () => {
		const course = courseRecordToCourseInfo(baseRecord)

		expect(course).toMatchObject({ id: 'course-id', code: 'COURSE', blockNames: ['Block one'] })
		expect(course.description).toBeUndefined()
		expect(course.createdAt).toEqual(new Date('2026-01-01T00:00:00.000Z'))
		expect(course.courseDefinition.specification).toMatchObject({
			startingPointIds: ['start'],
			learningGoalIds: ['goal'],
			blockLearningGoalIds: [['goal']],
		})
	})

	it('converts complete subscription data and rejects partial data', () => {
		const course = courseRecordToCourseInfo({
			...baseRecord,
			accessData: { role: 'teacher', subscribedAt: '2026-02-01T00:00:00.000Z', teachers: [] },
		})
		expect(course.subscription).toEqual({ role: 'teacher', subscribedAt: new Date('2026-02-01T00:00:00.000Z') })
		expect(course.teachers).toEqual([])

		expect(() => courseRecordToCourseInfo({
			...baseRecord,
			accessData: { role: 'student', subscribedAt: null },
		})).toThrow(/role and subscription date/)
	})

	it('converts teacher-visible student skill data', () => {
		const record: CourseWithStudentSkillsRecord = {
			...baseRecord,
			teacherData: {
				students: [{
					id: 'student-id',
					name: null,
					givenName: null,
					familyName: null,
					sharedData: { email: null, skills: [] },
					accountData: null,
				}],
			},
		}
		const course = courseWithStudentSkillsRecordToCourseInfo(record)

		expect(course.students?.[0]).toMatchObject({ id: 'student-id', skills: [] })
		expect(course.students?.[0]?.skillLevelSet).toBeInstanceOf(SkillLevelSet)
	})
})
