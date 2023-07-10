import React from 'react'

import { M } from 'ui/components/math'

import KeyboardLayout from '../KeyboardLayout'

export const tab = <M>\rm abc</M>

const defaultKeys = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'Backspace', 'Power', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ArrowUp', 'Times', 'Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'Divide']
const upperCaseKeys = defaultKeys.map(keyID => keyID.length === 1 ? keyID.toUpperCase() : keyID)

export function Layout({ settings, keyFunction, keySettings }) {
	const numColumns = 25 // Buttons are two columns.
	const numRows = 3
	const keys = ({ shift }) => shift ? upperCaseKeys : defaultKeys

	// Define styles to position buttons.
	const styles = {
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
		'& .keyPower': { gridColumn: '24 / span 2' },
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
		'& .keyTimes': { gridColumn: '24 / span 2' },
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
		'& .keyDivide': { gridColumn: '24 / span 2' },
	}

	return <KeyboardLayout {...{
		settings,
		keyFunction,
		keySettings,
		keys,
		numColumns,
		numRows,
		styles,
		widthToRowHeight: width => width / numColumns * 2, // Buttons are usually two columns.
	}} />
}
