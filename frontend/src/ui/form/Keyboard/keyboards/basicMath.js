import React from 'react'
import { useTheme } from '@material-ui/core/styles'

import { numberArray } from 'step-wise/util/arrays'

import { useCurrentOrPrevious } from 'util/react'
import { M } from 'ui/components/equations'

import KeyboardLayout from './KeyboardLayout'

export const tab = <M>\rm sin\left(\pi\right)</M>

const keyGrid = [
	...['1', '2', '3', 'Plus', 'Minus', 'sin', 'asin', 'root', 'dot', 'pi'],
	...['4', '5', '6', 'Times', 'Divide', 'cos', 'acos', 'ln', 'hat', 'eMath'],
	...['7', '8', '9', 'Power', 'Underscore', 'tan', 'atan', 'log', 'ArrowUp', 'Backspace'],
	...['Equals', '0', '.', 'BracketOpen', 'BracketClose', 'Spacebar', 'ArrowLeft', 'ArrowDown', 'ArrowRight'],
]
const numbers = numberArray(0, 9)

export function Layout({ settings, keyFunction, keySettings }) {
	settings = useCurrentOrPrevious(settings) // When the settings turn to null, use the previous one for display purposes.
	const theme = useTheme()
	const numColumns = 10
	const numRows = 4

	// Define styles to position buttons.
	const styles = {
		// Adjust the number key styles.
		[numbers.map(prefix => `& .key${prefix}`).join(', ')]: {
			background: theme.palette.secondary.main,
			'&:active': {
				background: theme.palette.secondary.dark,
			},
		},
		'& .keySpacebar': {
			gridColumn: '6 / span 2',
		},
	}

	return <KeyboardLayout {...{
		settings,
		keyFunction,
		keySettings,
		keys: keyGrid,
		maxWidth: 600,
		numColumns,
		numRows,
		styles,
	}} />
}

export const keys = keyGrid.flat()