import type { CurrentUser, UserRole } from './types.ts'
import { useCurrentUserQuery } from './queries/index.ts'

export function useUser(): CurrentUser | undefined {
	return useCurrentUserQuery().user
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
