// This is a hack (override) around the Material-UI button limitation to only accept primary or secondary colors.

import React, { forwardRef } from 'react'
import { createTheme, ThemeProvider, useTheme } from '@material-ui/core/styles'
import MuiButton from '@material-ui/core/Button'

const getAdjustedTheme = (color) => createTheme({
	palette: {
		primary: color,
	}
})

const Button = forwardRef((props, ref) => {
	const theme = useTheme()
	const { color: colorString } = props
	const color = theme.palette[colorString]
	if (!color)
		throw new Error(`Invalid color: the color "${colorString}" is not in the palette.`)

	const ButtonType = props.buttonType || MuiButton

	return (
		<ThemeProvider theme={getAdjustedTheme(color)}>
			<ButtonType {...props} ref={ref} color="primary" />
		</ThemeProvider>
	)
})
export default Button
