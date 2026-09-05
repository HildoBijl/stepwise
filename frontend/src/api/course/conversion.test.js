import { describe, expect, it } from 'vitest'

import { SkillLevelSet } from '@step-wise/skill-tracking'

import { courseRecordToCourseData } from './conversion'

describe('course API conversion', () => {
	it('flattens available access data', () => {
		const course = courseRecordToCourseData({
			id: 'course-id',
			accessData: { role: 'teacher', teachers: [{ id: 'teacher-id' }] },
			teacherData: { students: [{ id: 'student-id', name: null, givenName: null, familyName: null, sharedData: null, accountData: null }] },
		})
		expect(course).toMatchObject({ id: 'course-id', role: 'teacher', teachers: [{ id: 'teacher-id' }], students: [{ id: 'student-id', skills: [] }] })
		expect(course.students[0].skillLevelSet).toBeInstanceOf(SkillLevelSet)
	})

	it('keeps public courses free of inaccessible fields', () => {
		expect(courseRecordToCourseData({ id: 'course-id', accessData: null, teacherData: null })).toEqual({ id: 'course-id' })
	})
})
