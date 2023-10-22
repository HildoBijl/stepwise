import React from 'react'

import { M } from 'ui/components'

import { KeyboardLayout } from '../KeyboardLayout'

export const Tab = () => <M>\rm kg/s</M>

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
	const numColumns = 11
	const numRows = 5

	// Add classnames to keys.
	const keyClassNames = {}
	const applySecondary = number => keyClassNames[number] = 'secondary'
	prefixesUp.forEach(applySecondary)
	prefixesDown.forEach(applySecondary)

	return <KeyboardLayout {...{
		settings,
		keyFunction,
		keySettings,
		keys,
		maxWidth: 600,
		numColumns,
		numRows,
		keyClassNames,
	}} />
}
