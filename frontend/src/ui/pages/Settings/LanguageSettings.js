import React from 'react'
import { Box } from '@mui/material'
import { Info } from '@mui/icons-material'
import { GB, NL, DE } from 'country-flag-icons/react/3x2'

import { Translation, TranslationGroup } from '@step-wise/i18n'

import { useLanguage } from 'i18nNext'
import { Par, Head } from 'ui/components'

import { Language } from './Language'

export function LanguageSettings() {
	const language = useLanguage()
	return <TranslationGroup path="language">
		<Head>
			<Translation id="title">Language settings</Translation>
		</Head>

		<Language Flag={GB} language="en"><Translation id="en">English</Translation></Language>
		<Language Flag={NL} language="nl"><Translation id="nl">Dutch</Translation></Language>
		<Language Flag={DE} language="de"><Translation id="de">German</Translation></Language>

		{language !== 'en' && language !== 'nl' ? <Par sx={theme => ({
			alignItems: 'center',
			color: theme.palette.info.main,
			display: 'flex',
			flexFlow: 'row nowrap',
			fontWeight: 'bold',
		})}>
			<Box sx={{ lineHeight: 0, marginRight: '0.75em' }}><Info /></Box>
			<Box><Translation id="warning">Not all content may be available in this language. Content in other languages may occasionally still appear.</Translation></Box>
		</Par> : null}
	</TranslationGroup>
}
