import React from 'react'

import { Translation } from '@step-wise/i18n'

import { signOutAddress } from 'settings'

// SignOut is a React component that, once you mount it, signs the user out.
export function SignOut() {
	window.location.href = signOutAddress
	return <p><Translation folder={[]} catalog="main" group={['signOut']} id="message">You're being signed out...</Translation></p> // ToDo later: turn into some fancy loader? Or someone waving goodbye?
}
