import React from 'react'

import { numberArray } from 'step-wise/util'

import { M } from 'ui/components'

import { KeyboardLayout } from '../KeyboardLayout'

export const Tab = () => <M>\rm sin\left(\pi\right)</M>

const keyGrid = [
	...['1', '2', '3', 'Plus', 'Minus', 'sin', 'asin', 'root', 'dot', 'pi'],
	...['4', '5', '6', 'Times', 'Divide', 'cos', 'acos', 'ln', 'hat', 'eMath'],
	...['7', '8', '9', 'Power', 'Underscore', 'tan', 'atan', 'log', 'ArrowUp', 'Backspace'],
	...['Equals', '0', 'DecimalSeparator', 'BracketOpen', 'BracketClose', 'Spacebar', 'ArrowLeft', 'ArrowDown', 'ArrowRight'],
]
const numbers = numberArray(0, 9)

export function Layout({ settings, keyFunction, keySettings }) {
	const numColumns = 10
	const numRows = 4

	// Define styles to position buttons.
	const styles = {
		'& .keySpacebar': {
			gridColumn: '6 / span 2',
		},
	}

	// Add classnames to keys.
	const keyClassNames = {}
	numbers.forEach(number => keyClassNames[number] = 'secondary')

	return <KeyboardLayout {...{
		settings,
		keyFunction,
		keySettings,
		keys: keyGrid,
		maxWidth: 600,
		numColumns,
		numRows,
		styles,
		keyClassNames,
	}} />
}

export const keys = keyGrid.flat()
