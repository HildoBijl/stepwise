import React from 'react'

import { useUser } from 'api/user'

import { Par } from 'ui/components'
import { Translation } from 'i18n'

import { PageTranslationFile } from '../PageTranslationFile'

import { LanguageSettings } from './LanguageSettings'
import { DeleteAccount } from './DeleteAccount'

export function Settings() {
	const { name, email } = useUser()
	return <PageTranslationFile page="settings">
		<Par><Translation entry="introduction">You are logged in as {{ name }} &lt;{{ email }}&gt;.</Translation></Par>
		<LanguageSettings />
		<DeleteAccount />
	</PageTranslationFile>
}
