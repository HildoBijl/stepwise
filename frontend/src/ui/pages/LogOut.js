import React from 'react'

import { logOutAddress } from 'settings'

// LogOut is a React component that, once you mount it, logs the user out.
export default function LogOut() {
	window.location.href = logOutAddress
	return <p>Je wordt uitgelogd...</p> // ToDo later: turn into some fancy loader? Or someone waving goodbye?
}
