import type { CurrentUser, UserRole } from './types.ts'
import { useCurrentUserQuery } from './queries.ts'

export function useUserResult() {
	return useCurrentUserQuery()
}

export function useUser(): CurrentUser | null {
	return useUserResult().data?.me ?? null
}

export function useUserId(): string | undefined {
	return useUser()?.id
}

export function useIsSignedIn(): boolean {
	return useUser() !== null
}

export function useUserRole(): UserRole | undefined {
	return useUser()?.role
}

export function useIsAdmin(): boolean {
	return useUserRole() === 'admin'
}

export function useIsUserDataLoaded(): boolean {
	return useUserResult().data !== undefined
}
