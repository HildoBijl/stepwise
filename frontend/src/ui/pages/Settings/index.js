import React from 'react'

import { useUser } from 'api/user'

import { Par } from 'ui/components'

import { LanguageSettings } from './LanguageSettings'
import { DeleteAccount } from './DeleteAccount'

export function Settings() {
	const user = useUser()
	return <>
		<Par>Je bent ingelogd als {user.name} &lt;{user.email}&gt;.</Par>
		<LanguageSettings />
		<DeleteAccount />
	</>
}
