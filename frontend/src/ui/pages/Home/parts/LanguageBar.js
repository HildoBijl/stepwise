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
	flagContainer: {
		background: 'black',
		cursor: ({ active }) => active ? 'default' : 'pointer',
		opacity: ({ active }) => active ? 1 : 0.5,
		transition: `opacity ${theme.transitions.duration.standard}ms`,
		
		borderRadius: '0.75rem',
		margin: '0.4rem 0.15rem',
		width: '1.5rem',
		[theme.breakpoints.up('md')]: {
			borderRadius: '1rem',
			margin: '0.5rem 0.2rem',
			width: '2rem',
		},

		'&:hover': {
			opacity: ({ active }) => active ? 1 : 0.8,
		},
	},
	languageBarFlag: {
		borderRadius: '1rem',
		display: 'block',
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
	return <div className={classes.flagContainer}>
		<Flag className={classes.languageBarFlag} onClick={() => setLanguage(language)} />
	</div>
}
