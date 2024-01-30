import React from 'react'

import { logOutAddress } from 'settings'

import { Translation } from 'i18n'

// LogOut is a React component that, once you mount it, logs the user out.
export function LogOut() {
	window.location.href = logOutAddress
	return <Translation path="main" entry="login.loggingOut"><p>You're being signed out...</p></Translation> // ToDo later: turn into some fancy loader? Or someone waving goodbye?
}
