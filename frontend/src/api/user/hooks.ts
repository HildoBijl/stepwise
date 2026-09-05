import type { CurrentUser, UserRole } from './types.ts'
import { currentUserRecordToUser } from './conversion.ts'
import { useCurrentUserQuery } from './queries.ts'

export function useUser(): CurrentUser | undefined {
	const { userRecord } = useCurrentUserQuery()
	return userRecord ? currentUserRecordToUser(userRecord) : undefined
}

export function useRequiredUser(): CurrentUser {
	const user = useUser()
	if (!user) throw new Error('A signed-in user is required here.')
	return user
}

export function useUserId(): string | undefined {
	return useUser()?.id
}

export function useIsSignedIn(): boolean {
	return useUser() !== undefined
}

export function useUserRole(): UserRole | undefined {
	return useUser()?.role
}

export function useIsAdmin(): boolean {
	return useUserRole() === 'admin'
}

export function useIsUserLoading(): boolean {
	return useCurrentUserQuery().loading
}
