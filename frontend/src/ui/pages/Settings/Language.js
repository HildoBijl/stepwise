import React from 'react'

import { makeStyles } from '@material-ui/core/styles'
import { alpha } from '@material-ui/core/styles/colorManipulator'

import { useSetLanguageMutation } from 'api/user'
import { useLanguage } from 'i18n'

const useStyles = makeStyles((theme) => ({
	language: {
		alignItems: 'center',
		background: ({ active }) => alpha(theme.palette[active ? 'success' : 'info'].main, 0.2),
		borderRadius: '0.5em',
		cursor: 'pointer',
		display: 'flex',
		flexFlow: 'row nowrap',
		fontSize: '1.2em',
		margin: `0.25em 0`,
		padding: `0.5em 0.75em`,

		'& .flag': {
			marginRight: '0.75em',
			height: '1.2em',
			width: '1.8em',
		},

		'& .language': {},
	},
}))

export function Language({ Flag, language, text }) {
	const currentLanguage = useLanguage()
	const [setUserLanguage] = useSetLanguageMutation()
	const active = language === currentLanguage

	const classes = useStyles({ active })
	return <div className={classes.language} onClick={() => setUserLanguage(language)}>
		<div className="flag"><Flag /></div>
		<div className="language">{text}</div>
	</div>
}
