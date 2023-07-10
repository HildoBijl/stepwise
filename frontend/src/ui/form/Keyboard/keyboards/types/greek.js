import React from 'react'

import { M } from 'ui/components/math'

import KeyboardLayout from '../KeyboardLayout'

export const tab = <M>\alpha \beta \gamma</M>

const defaultKeys = ['alpha','beta','gamma','delta','epsilon','zeta','eta','theta','iota','Backspace','kappa','lambda','mu','nu','xi','omicron','pi','rho','sigma','ArrowUp','Shift','tau','upsilon','phi','chi','psi','omega','ArrowLeft','ArrowDown','ArrowRight']
const upperCaseKeys = defaultKeys.map(keyID => keyID[0].toUpperCase() === keyID[0] ? keyID : (keyID[0].toUpperCase() + keyID.slice(1)))

export function Layout({ settings, keyFunction, keySettings }) {
	const numColumns = 11 // Buttons are two columns.
	const numRows = 3
	const keys = ({ shift }) => shift ? upperCaseKeys : defaultKeys

	// Define styles to position buttons.
	const styles = {		
		'& .keyBackspace': { gridColumn: '10 / span 2' },
		'& .keyShift': { gridColumn: '1 / span 2' },
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
		widthToRowHeight: width => width / numColumns, // Buttons are usually two columns.
	}} />
}
