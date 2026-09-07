import React from 'react'

import { useRequiredUser } from 'api'
import { Translation } from 'i18n'
import { Par } from 'ui/components'

import { PageTranslationFile } from '../PageTranslationFile'

import { LanguageSettings } from './LanguageSettings'
import { DeleteAccount } from './DeleteAccount'

export function Settings() {
	const { name, email } = useRequiredUser()
	return <PageTranslationFile page="settings">
		<Par><Translation entry="introduction">You are signed in as {{ name }} &lt;{{ email }}&gt;.</Translation></Par>
		<LanguageSettings />
		<DeleteAccount />
	</PageTranslationFile>
}
