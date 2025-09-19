import React from 'react'
import { Container } from '@mui/material'

import { Translation } from 'i18n'

export function Description() {
	return <Container maxWidth='lg' sx={theme => ({
		fontSize: '0.9em',
		fontWeight: '300',
		padding: '1.5em',
		textAlign: 'center',
		[theme.breakpoints.up('md')]: {
			fontSize: '1.2em',
			padding: '2em',
		},
	})}>
		<Translation entry="description">
			Step-Wise is a free tutoring web-app that brushes up your mathematics, physics and/or mechanics skills to (pre-)university level.
		</Translation>
	</Container>
}
