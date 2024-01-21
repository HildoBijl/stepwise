import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'

import { Translation } from 'i18n'

const useStyles = makeStyles((theme) => ({
	description: {
		color: theme.palette.secondary.main,
		textAlign: 'center',
		
		fontSize: '0.9em',
		padding: '1.5em',
		'@media (min-width: 768px)': {
			fontSize: '1.2em',
			padding: '2em',
		},
	},
}))

export function Description() {
	const classes = useStyles()
	return <Container maxWidth='lg' className={classes.description}>
		<Translation entry="description">
			Step-Wise is a free tutoring web-app that brushes up your mathematics, physics and/or mechanics skills for (pre-)university level.
		</Translation>
	</Container>
}
