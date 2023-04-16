import React from 'react'
import useMediaQuery from '@material-ui/core/useMediaQuery'

import { M } from 'ui/components/math'

import KeyboardLayout from './KeyboardLayout'

export const tab = <M>1{`{,}`}23</M>

export function Layout({ settings, keyFunction, keySettings }) {
	const smallScreen = !useMediaQuery(theme => theme.breakpoints.up('sm'))
	const numColumns = smallScreen ? 8 : (settings.allowPower ? 16 : (settings.positive ? 14 : 15))
	const numRows = smallScreen ? 2 : 1
	const keys = numRows === 1 ?
		['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Minus', '.', 'TenPower', 'ArrowLeft', 'ArrowRight', 'Backspace'] :
		['1', '2', '3', '4', '5', 'Minus', 'TenPower', 'Backspace', '6', '7', '8', '9', '0', '.', 'ArrowLeft', 'ArrowRight']

	// Define extra styles for properly displaying the backspace button when positive is true and/or allowPower is true.
	const styles = ({ settings, numRows }) => ({
		'& .keyBackspace': {
			gridColumn: numRows === 1 ? 'auto' : (
				settings.allowPower ? 'auto' : (
					settings.positive ? '6 / span 3' : '7 / span 2'
				)
			)
		},
		'& .keyMinus': {
			display: settings.positive && !settings.allowPower ? 'none' : 'block',
		},
		'& .keyTenPower': {
			display: settings.allowPower ? 'block' : 'none',
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