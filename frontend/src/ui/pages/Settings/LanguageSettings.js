import React from 'react'
import { Box } from '@mui/material'
import { Info } from '@mui/icons-material'
import { GB, NL, DE } from 'country-flag-icons/react/3x2'
import { Trans } from '@lingui/react/macro'

import { useLanguage } from 'i18n'
import { Par, Head } from 'ui/components'

import { Language } from './Language'

export function LanguageSettings() {
	const language = useLanguage()
	return <>
		<Head>
			<Trans id="settings.language.title">Language settings</Trans>
		</Head>

		<Language Flag={GB} language="en"><Trans id="settings.language.en">English</Trans></Language>
		<Language Flag={NL} language="nl"><Trans id="settings.language.nl">Dutch</Trans></Language>
		<Language Flag={DE} language="de"><Trans id="settings.language.de">German</Trans></Language>

		{language !== 'en' && language !== 'nl' ? <Par sx={theme => ({
			alignItems: 'center',
			color: theme.palette.info.main,
			display: 'flex',
			flexFlow: 'row nowrap',
			fontWeight: 'bold',
		})}>
			<Box sx={{ lineHeight: 0, marginRight: '0.75em' }}><Info /></Box>
			<Box><Trans id="settings.language.warning">Not all content may be available in this language. Content in other languages may occasionally still appear.</Trans></Box>
		</Par> : null}
	</>
}
