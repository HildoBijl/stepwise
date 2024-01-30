import { useUserResult } from './provider'

export { useUserResult }

// Only get the resulting user.
export function useUser() {
	const res = useUserResult()
	return (res && res.data && res.data.me) || null
}

// Only get the user ID.
export function useUserId() {
	const user = useUser()
	return user?.id
}

// Check if the user is signed in.
export function useIsSignedIn() {
	return !!useUser()
}

// Only get the role.
export function useUserRole() {
	const user = useUser()
	return user?.role
}

// Check whether the user is an admin.
export function useIsAdmin() {
	const role = useUserRole()
	return role === 'admin'
}

// Check if user data is done loading.
export function useIsUserDataLoaded() {
	const res = useUserResult()
	return !!(res && res.data)
}
