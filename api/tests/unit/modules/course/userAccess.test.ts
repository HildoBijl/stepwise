import { canViewStudentPrivateData } from '../../../../src/modules/course/userAccess.ts'
import type { UserContext, UserRecord } from '../../../../src/modules/user/index.ts'

describe('course private-data access', () => {
	it.each([
		[[], false],
		[[{ id: 'course-id' }], true],
	])('allows access exactly when a course contains the student', async (courses, expected) => {
		const load = vi.fn().mockResolvedValue(courses)
		const context = { loaders: { coursesWithStudent: { load } } } as unknown as UserContext
		const user = { id: 'student-id' } as UserRecord
		await expect(canViewStudentPrivateData(user, context)).resolves.toBe(expected)
		expect(load).toHaveBeenCalledWith(user.id)
	})

	it('propagates loader failures', async () => {
		const error = new Error('loader failed')
		const context = { loaders: { coursesWithStudent: { load: vi.fn().mockRejectedValue(error) } } } as unknown as UserContext
		await expect(canViewStudentPrivateData({ id: 'student-id' } as UserRecord, context)).rejects.toBe(error)
	})
})
