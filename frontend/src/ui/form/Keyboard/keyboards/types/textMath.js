import React from 'react'

import { numberArray } from 'step-wise/util'

import { M } from 'ui/components'

import { KeyboardLayout } from '../KeyboardLayout'

export const Tab = () => <M>\rm abc</M>

const defaultKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'DecimalSeparator', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'Backspace', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ArrowUp', 'Equals', 'Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'BracketOpen', 'BracketClose', 'Power', 'Underscore', 'Spacebar', 'Plus', 'Minus', 'Times', 'Divide']
const upperCaseKeys = defaultKeys.map(keyID => keyID.length === 1 ? keyID.toUpperCase() : keyID)

export function Layout({ settings, keyFunction, keySettings }) {
	const numColumns = 23 // Buttons are two columns.
	const numRows = 5
	const keys = ({ shift }) => shift ? upperCaseKeys : defaultKeys

	// Define styles to position buttons.
	const styles = {
		'& .key1': { gridColumn: '1 / span 2' },
		'& .key2': { gridColumn: '3 / span 2' },
		'& .key3': { gridColumn: '5 / span 2' },
		'& .key4': { gridColumn: '7 / span 2' },
		'& .key5': { gridColumn: '9 / span 2' },
		'& .key6': { gridColumn: '11 / span 2' },
		'& .key7': { gridColumn: '13 / span 2' },
		'& .key8': { gridColumn: '15 / span 2' },
		'& .key9': { gridColumn: '17 / span 2' },
		'& .key0': { gridColumn: '19 / span 2' },
		'& .keyDecimalSeparator': { gridColumn: '21 / span 3' },
		'& .keyq, & .keyQ': { gridColumn: '1 / span 2' },
		'& .keyw, & .keyW': { gridColumn: '3 / span 2' },
		'& .keye, & .keyE': { gridColumn: '5 / span 2' },
		'& .keyr, & .keyR': { gridColumn: '7 / span 2' },
		'& .keyt, & .keyT': { gridColumn: '9 / span 2' },
		'& .keyy, & .keyY': { gridColumn: '11 / span 2' },
		'& .keyu, & .keyU': { gridColumn: '13 / span 2' },
		'& .keyi, & .keyI': { gridColumn: '15 / span 2' },
		'& .keyo, & .keyO': { gridColumn: '17 / span 2' },
		'& .keyp, & .keyP': { gridColumn: '19 / span 2' },
		'& .keyBackspace': { gridColumn: '21 / span 3' },
		'& .keya, & .keyA': { gridColumn: '2 / span 2' },
		'& .keys, & .keyS': { gridColumn: '4 / span 2' },
		'& .keyd, & .keyD': { gridColumn: '6 / span 2' },
		'& .keyf, & .keyF': { gridColumn: '8 / span 2' },
		'& .keyg, & .keyG': { gridColumn: '10 / span 2' },
		'& .keyh, & .keyH': { gridColumn: '12 / span 2' },
		'& .keyj, & .keyJ': { gridColumn: '14 / span 2' },
		'& .keyk, & .keyK': { gridColumn: '16 / span 2' },
		'& .keyl, & .keyL': { gridColumn: '18 / span 2' },
		'& .keyArrowUp': { gridColumn: '20 / span 2' },
		'& .keyEquals': { gridColumn: '22 / span 2' },
		'& .keyShift': { gridColumn: '1 / span 3' },
		'& .keyz, & .keyZ': { gridColumn: '4 / span 2' },
		'& .keyx, & .keyX': { gridColumn: '6 / span 2' },
		'& .keyc, & .keyC': { gridColumn: '8 / span 2' },
		'& .keyv, & .keyV': { gridColumn: '10 / span 2' },
		'& .keyb, & .keyB': { gridColumn: '12 / span 2' },
		'& .keyn, & .keyN': { gridColumn: '14 / span 2' },
		'& .keym, & .keyM': { gridColumn: '16 / span 2' },
		'& .keyArrowLeft': { gridColumn: '18 / span 2' },
		'& .keyArrowDown': { gridColumn: '20 / span 2' },
		'& .keyArrowRight': { gridColumn: '22 / span 2' },
		'& .keyBracketOpen': { gridColumn: '1 / span 2' },
		'& .keyBracketClose': { gridColumn: '3 / span 2' },
		'& .keyPower': { gridColumn: '5 / span 2' },
		'& .keyUnderscore': { gridColumn: '7 / span 2' },
		'& .keySpacebar': { gridColumn: '9 / span 7' },
		'& .keyPlus': { gridColumn: '16 / span 2' },
		'& .keyMinus': { gridColumn: '18 / span 2' },
		'& .keyTimes': { gridColumn: '20 / span 2' },
		'& .keyDivide': { gridColumn: '22 / span 2' },
	}

	// Add classnames to keys.
	const keyClassNames = {}
	const secondaryButtons = [...numberArray(0, 9), 'DecimalSeparator', 'Equals', 'BracketOpen', 'BracketClose', 'Power', 'Underscore', 'Plus', 'Minus', 'Times', 'Divide']
	secondaryButtons.forEach(key => keyClassNames[key] = 'secondary')

	return <KeyboardLayout {...{
		settings,
		keyFunction,
		keySettings,
		keys,
		maxWidth: 600,
		numColumns,
		numRows,
		styles,
		keyClassNames,
		widthToRowHeight: width => width / numColumns * 2, // Buttons are usually two columns.
	}} />
}
