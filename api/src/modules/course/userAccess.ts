import type { UserContext, UserRecord } from '../user'

export async function canViewStudentPrivateData(user: UserRecord, context: UserContext): Promise<boolean> {
	const coursesWithStudent = await context.loaders.coursesWithStudent.load(user.id)
	return coursesWithStudent.length > 0
}
