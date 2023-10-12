import React from 'react'

import { UserProvider } from './provider'
import { LanguageSetter } from './LanguageSetter'

// The UserWrapper is a wrapper that wraps all user functionalities, most of all the UserProvider providing user data.
export function UserWrapper({ children }) {
	return <UserProvider>
		<LanguageSetter />
		{children}
	</UserProvider>
}
