import { describe, expect, it } from 'vitest'

import { courseRecordToCourseData } from './conversion'

describe('course API conversion', () => {
	it('flattens available access data', () => {
		expect(courseRecordToCourseData({
			id: 'course-id',
			accessData: { role: 'teacher', teachers: [{ id: 'teacher-id' }] },
			teacherData: { students: [{ id: 'student-id', sharedData: null, accountData: null }] },
		})).toEqual({ id: 'course-id', role: 'teacher', teachers: [{ id: 'teacher-id' }], students: [{ id: 'student-id', skills: [] }] })
	})

	it('keeps public courses free of inaccessible fields', () => {
		expect(courseRecordToCourseData({ id: 'course-id', accessData: null, teacherData: null })).toEqual({ id: 'course-id' })
	})
})
