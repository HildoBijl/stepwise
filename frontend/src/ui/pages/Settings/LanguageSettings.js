import React from 'react'

import { makeStyles } from '@material-ui/core/styles'
import { Info } from '@material-ui/icons'
import { GB, NL, DE } from 'country-flag-icons/react/3x2'

import { TranslationSection, Translation, useLanguage } from 'i18n'

import { Par, Head } from 'ui/components'

import { Language } from './Language'

const useStyles = makeStyles((theme) => ({
	languageWarning: {
		alignItems: 'center',
		color: theme.palette.info.main,
		display: 'flex',
		flexFlow: 'row nowrap',
		fontWeight: 'bold',

		'& .icon': {
			lineHeight: 0,
			marginRight: '0.75em',
		},

		'& .text': {},
	},
}))

export function LanguageSettings() {
	const language = useLanguage()
	const classes = useStyles()
	return <TranslationSection entry="language">
		<Head>
			<Translation entry="title">Language settings</Translation>
		</Head>

		<TranslationSection entry="languageList">
			<Language Flag={GB} language="en" text="English" />
			<Language Flag={NL} language="nl" text="Dutch" />
			<Language Flag={DE} language="de" text="German" />
		</TranslationSection>

		{language !== 'en' && language !== 'nl' ? <Par className={classes.languageWarning}>
			<div className="icon"><Info /></div>
			<div className="text"><Translation entry="warning">Not all content may be available in this language. Content in other languages may occasionally still appear.</Translation></div>
		</Par> : null}
	</TranslationSection>
}
