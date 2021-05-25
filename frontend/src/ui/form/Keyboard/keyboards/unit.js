import React from 'react'
import { useTheme } from '@material-ui/core/styles'

import { useCurrentOrPrevious } from 'util/react'
import { M } from 'ui/components/equations'

import KeyboardLayout from './KeyboardLayout'

export const tab = <M>\rm kg/s</M>

const prefixesUp = ['da', 'h', 'k', 'M', 'G', 'T', 'P', 'E']
const prefixesDown = ['d', 'c', 'm', 'μ', 'n', 'p', 'f', 'a']
const keys = [
	...['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Minus'],
	...['Meter', 's', 'J', 'K', 'Pa', 'A', 'C', 'Hz', 'rad', 'l', 'Power'],
	...['g', 'N', 'W', '°C', 'bar', 'V', 'Ω', 'F', '°', '%', 'Times'],
	...[...prefixesUp, 'Backspace', 'ArrowUp', 'Divide'],
	...[...prefixesDown, 'ArrowLeft', 'ArrowDown', 'ArrowRight'],
]

export function Layout({ settings, keyFunction, keySettings }) {
	settings = useCurrentOrPrevious(settings) // When the settings turn to null, use the previous one for display purposes.
	const theme = useTheme()
	const numColumns = 11
	const numRows = 5

	// Define styles to position buttons.
	const styles = {
		// Adjust the prefix key styles.
		[[...prefixesUp, ...prefixesDown].map(prefix => `& .key${prefix}`).join(', ')]: {
			background: theme.palette.secondary.main,
			'&:active': {
				background: theme.palette.secondary.dark,
			},
		}
	}

	return <KeyboardLayout {...{
		settings,
		keyFunction,
		keySettings,
		keys,
		maxWidth: 600,
		numColumns,
		numRows,
		styles,
	}} />
}