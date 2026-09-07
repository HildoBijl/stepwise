import React from 'react'

import { signOutAddress } from 'settings'

import { Translation } from 'i18n'

// SignOut is a React component that, once you mount it, signs the user out.
export function SignOut() {
	window.location.href = signOutAddress
	return <Translation path="main" entry="signOut.message"><p>You're being signed out...</p></Translation> // ToDo later: turn into some fancy loader? Or someone waving goodbye?
}
