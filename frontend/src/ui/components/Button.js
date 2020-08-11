// This is a hack around the Material-UI button limitation to only accept primary or secondary colors.

import React from 'react'
import { createMuiTheme } from '@material-ui/core/styles'
import { ThemeProvider } from '@material-ui/core/styles'
import MuiButton from '@material-ui/core/Button'
import theme from '../theme'

const getAdjustedTheme = (color) => createMuiTheme({
	palette: {
		primary: color,
	}
})

export default function Button(props) {
	const color = theme.palette[props.color]
	if (!color)
		throw new Error(`Invalid color: the color "${props.color}" is not in the palette.`)

	return (
		<ThemeProvider theme={getAdjustedTheme(color)}>
			<MuiButton {...props} color="primary" />
		</ThemeProvider>
	)
}