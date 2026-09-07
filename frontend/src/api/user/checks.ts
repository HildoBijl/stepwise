import type { UserWithAccountData } from './types.ts'

type UserWithRole = Pick<UserWithAccountData, 'role'>

export function isTeacher(user: UserWithRole | undefined): boolean {
	return user?.role === 'teacher'
}

export function isAdmin(user: UserWithRole | undefined): boolean {
	return user?.role === 'admin'
}
