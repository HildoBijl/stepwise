import React from 'react'
import { ph } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { TranslationCatalog } from '@step-wise/i18n'

import { useRequiredUser } from 'api'
import { Par } from 'ui/components'

import { LanguageSettings } from './LanguageSettings'
import { DeleteAccount } from './DeleteAccount'

export function Settings() {
	return <TranslationCatalog path="pages/settings">
		<SettingsContents />
	</TranslationCatalog>
}

function SettingsContents() {
	const { name, email } = useRequiredUser()
	return <>
		<Par><Trans id="settings.introduction">You are signed in as {ph({ name })} &lt;{ph({ email })}&gt;.</Trans></Par>
		<LanguageSettings />
		<DeleteAccount />
	</>
}
