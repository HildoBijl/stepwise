import React from 'react'

import { Translation, TranslationCatalog, TranslationFolder } from '@step-wise/i18n'

import { useRequiredUser } from 'api'
import { Par } from 'ui/components'

import { LanguageSettings } from './LanguageSettings'
import { DeleteAccount } from './DeleteAccount'

export function Settings() {
	return <TranslationFolder path="pages">
		<TranslationCatalog name="settings">
			<SettingsContents />
		</TranslationCatalog>
	</TranslationFolder>
}

function SettingsContents() {
	const { name, email } = useRequiredUser()
	return <>
		<Par><Translation id="introduction">You are signed in as {{ name }} &lt;{{ email }}&gt;.</Translation></Par>
		<LanguageSettings />
		<DeleteAccount />
	</>
}
