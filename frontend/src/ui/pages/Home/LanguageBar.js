import React from 'react'
import { GB, NL, DE } from 'country-flag-icons/react/3x2'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'

import { useLanguage, useSetLanguage } from 'i18n'

const useStyles = makeStyles((theme) => ({
	languageBar: {
		display: 'flex',
		flexFlow: 'row nowrap',
		flexDirection: 'row-reverse',
	},
	languageBarFlag: {
		borderRadius: '1rem',
		cursor: ({ active }) => active ? 'default' : 'pointer',
		margin: '0.4rem 0.1rem',
		opacity: ({ active }) => active ? 1 : 0.3,
		transition: `opacity ${theme.transitions.duration.standard}ms`,
		width: '2rem',

		'&:hover': {
			opacity: ({ active }) => active ? 1 : 0.6,
		},
	},
}))

export function LanguageBar() {
	const classes = useStyles()
	return <Container maxWidth='lg' className={classes.languageBar}>
		<LanguageBarFlag Flag={DE} language="de" />
		<LanguageBarFlag Flag={NL} language="nl" />
		<LanguageBarFlag Flag={GB} language="en" />
	</Container>
}

function LanguageBarFlag({ Flag, language }) {
	const currentLanguage = useLanguage()
	const setLanguage = useSetLanguage()
	const active = language === currentLanguage

	const classes = useStyles({ active })
	return <Flag className={classes.languageBarFlag} onClick={() => setLanguage(language)} />
}
