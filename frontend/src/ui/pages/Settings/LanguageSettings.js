import React from 'react'
import { Box } from '@mui/material'
import { Info } from '@mui/icons-material'
import { GB, NL, DE } from 'country-flag-icons/react/3x2'

import { TranslationSection, Translation, useLanguage } from 'i18n'

import { Par, Head } from 'ui/components'

import { Language } from './Language'

export function LanguageSettings() {
	const language = useLanguage()
	return <TranslationSection entry="language">
		<Head>
			<Translation entry="title">Language settings</Translation>
		</Head>

		<TranslationSection entry="languageList">
			<Language Flag={GB} language="en" text="English" />
			<Language Flag={NL} language="nl" text="Dutch" />
			<Language Flag={DE} language="de" text="German" />
		</TranslationSection>

		{language !== 'en' && language !== 'nl' ? <Par sx={theme => ({
			alignItems: 'center',
			color: theme.palette.info.main,
			display: 'flex',
			flexFlow: 'row nowrap',
			fontWeight: 'bold',
		})}>
			<Box sx={{ lineHeight: 0, marginRight: '0.75em' }}><Info /></Box>
			<Box><Translation entry="warning">Not all content may be available in this language. Content in other languages may occasionally still appear.</Translation></Box>
		</Par> : null}
	</TranslationSection>
}
