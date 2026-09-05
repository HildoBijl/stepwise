import React from 'react'

import { UserProvider } from './provider'

// The UserWrapper provides the current user data throughout the application.
export function UserWrapper({ children }) {
	return <UserProvider>
		{children}
	</UserProvider>
}
