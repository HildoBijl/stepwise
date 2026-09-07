import { describe, expect, it } from 'vitest'

import { SkillLevelSet } from '@step-wise/skill-tracking'

import type { CourseRecord, CourseWithStudentSkillsRecord, MyCourseRecord } from './records.ts'
import { isStudentCourse, isTeacherCourse } from './checks.ts'
import { courseRecordToCourseInfo, courseWithStudentSkillsRecordToCourseInfo, courseRecordsToMyCourses } from './conversion.ts'

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
}

function createMyCourseRecord(overrides: Pick<MyCourseRecord, 'subscription' | 'students'>): MyCourseRecord {
	return { ...baseRecord, ...overrides }
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

	it('converts subscription and empty teacher data', () => {
		const course = courseRecordToCourseInfo({
			...baseRecord,
			subscription: { role: 'teacher', subscribedAt: '2026-02-01T00:00:00.000Z' },
			teachers: [],
		})
		expect(course.subscription).toEqual({ role: 'teacher', subscribedAt: new Date('2026-02-01T00:00:00.000Z') })
		expect(course.teachers).toEqual([])
	})

	it('converts teacher-visible student skill data', () => {
		const record: CourseWithStudentSkillsRecord = {
			...baseRecord,
			subscription: { role: 'teacher', subscribedAt: '2026-02-01T00:00:00.000Z' },
			teachers: [],
			students: [{
				id: 'student-id',
				name: null,
				givenName: null,
				familyName: null,
				sharedData: { email: null, skills: [] },
				accountData: null,
			}],
		}
		const course = courseWithStudentSkillsRecordToCourseInfo(record)

		expect(course.students?.[0]).toMatchObject({ id: 'student-id', skills: [] })
		expect(course.students?.[0]?.skillLevelSet).toBeInstanceOf(SkillLevelSet)
	})

	it('classifies own courses, preserves admin-visible students, and guarantees students for teacher courses', () => {
		const studentRecord = createMyCourseRecord({
			subscription: { role: 'student', subscribedAt: '2026-02-01T00:00:00.000Z' },
			students: [],
		})
		const teacherRecord = createMyCourseRecord({
			subscription: { role: 'teacher', subscribedAt: '2026-02-02T00:00:00.000Z' },
			students: [],
		})
		const { studentCourses, teacherCourses } = courseRecordsToMyCourses([studentRecord, teacherRecord])

		expect(studentCourses).toHaveLength(1)
		expect(studentCourses[0]?.students).toEqual([])
		expect(teacherCourses).toHaveLength(1)
		expect(teacherCourses[0]?.students).toEqual([])
	})

	it('rejects incomplete own-course access data', () => {
		expect(() => courseRecordsToMyCourses([createMyCourseRecord({ subscription: null, students: null })])).toThrow(/does not have a subscription/)
		expect(() => courseRecordsToMyCourses([createMyCourseRecord({
			subscription: { role: 'teacher', subscribedAt: '2026-02-01T00:00:00.000Z' },
			students: null,
		})])).toThrow(/student data is missing/)
	})
})

describe('course checks', () => {
	it('only checks the subscription role', () => {
		const studentCourse = courseRecordToCourseInfo({
			...baseRecord,
			subscription: { role: 'student', subscribedAt: '2026-02-01T00:00:00.000Z' },
		})
		const teacherCourse = courseRecordToCourseInfo({
			...baseRecord,
			subscription: { role: 'teacher', subscribedAt: '2026-02-01T00:00:00.000Z' },
		})

		expect(isStudentCourse(studentCourse)).toBe(true)
		expect(isTeacherCourse(teacherCourse)).toBe(true)
	})
})
