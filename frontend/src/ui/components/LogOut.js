import React from 'react'

import { apiAddress } from '../settings'

// LogOut is a React component that, once you mount it, logs the user out.
export default function LogOut() {
	window.location.href = `${apiAddress}/auth/logout`
	return <p>Goodbye!</p> // ToDo: turn into some fancy loader? Or someone waving goodbye?
}
