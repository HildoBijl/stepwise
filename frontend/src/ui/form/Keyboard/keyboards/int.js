import React from 'react'
import useMediaQuery from '@material-ui/core/useMediaQuery'

import { useCurrentOrPrevious } from 'util/react'
import { M } from 'ui/components/equations'

import KeyboardLayout from './KeyboardLayout'

export const tab = <M>123</M>

export function Layout({ settings, keyFunction, keySettings }) {
	settings = useCurrentOrPrevious(settings) // When the settings turn to null, use the previous one for display purposes.
	const smallScreen = !useMediaQuery(theme => theme.breakpoints.up('sm'))
	const numColumns = smallScreen ? 7 : (settings.positive ? 13 : 14)
	const numRows = smallScreen ? 2 : 1
	const keys = numRows === 1 ?
		['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Minus', 'ArrowLeft', 'ArrowRight', 'Backspace'] :
		['1', '2', '3', '4', '5', 'Minus', 'Backspace', '6', '7', '8', '9', '0', 'ArrowLeft', 'ArrowRight']

	// Define extra styles for properly displaying the backspace button on a positive IntegerInput.
	const styles = ({ settings, numRows }) => ({
		'& .keyBackspace': {
			gridColumn: settings.positive && numRows === 2 ? '6 / span 2' : 'auto', // When only positive numbers are allowed, span two columns.
		},
		'& .keyMinus': {
			display: settings.positive ? 'none' : 'block',
		},
	})

	return <KeyboardLayout {...{
		settings,
		keyFunction,
		keySettings,
		keys,
		numColumns,
		numRows,
		styles,
	}} />
}