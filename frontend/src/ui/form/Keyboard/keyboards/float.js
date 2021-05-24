import React from 'react'
import useMediaQuery from '@material-ui/core/useMediaQuery'

import { useCurrentOrPrevious } from 'util/react'
import { M } from 'ui/components/equations'

import KeyboardLayout from './KeyboardLayout'

export const tab = <M>1.23</M>

// These are commonly used settings for the keyboard.
export const settings = {
	standard: { float: {} },
	positive: { float: { Minus: false } },
	minusDisabled: { float: { '.': false, TenPower: false } },
}

export function Layout({ settings, keyFunction }) {
	settings = useCurrentOrPrevious(settings) // When the settings turn to null, use the previous one for display purposes.
	const smallScreen = !useMediaQuery(theme => theme.breakpoints.up('sm'))
	const numColumns = smallScreen ? 8 : 16
	const numRows = smallScreen ? 2 : 1
	const keys = numRows === 1 ?
		['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Minus', '.', 'TenPower', 'ArrowLeft', 'ArrowRight', 'Backspace'] :
		['1', '2', '3', '4', '5', 'Minus', 'TenPower', 'Backspace', '6', '7', '8', '9', '0', '.', 'ArrowLeft', 'ArrowRight']

	return <KeyboardLayout {...{
		settings,
		keyFunction,
		keys,
		numColumns,
		numRows,
		styles: {},
	}} />
}