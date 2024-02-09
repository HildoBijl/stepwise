import React from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { Container } from '@material-ui/core'

import { pageContainerStyle, linkStyle } from 'ui/theme'

const useStyles = makeStyles((theme) => ({
	pageContainer: {
		...pageContainerStyle,
		'& a': {
			...linkStyle
		},
	},
}))

export function PageContainer({ children }) {
	const theme = useTheme()
	const classes = useStyles()
	return <Container maxWidth={theme.appWidth} className={classes.pageContainer}>{children}</Container>
}
