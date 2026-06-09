import { asUnitElement } from '../UnitElement'

import type { UnitElementArray, UnitElementArrayInput } from './types'

// Turn a string like 'kg * m / s^2' into parts based on the position of the slash.
export function splitUnitString(str: string): { numerator: string, denominator: string } {
	if (str.includes('(') || str.includes(')')) throw new Error(`Invalid unit input: brackets are not necessary in units. Enter them like "N * m^2 / kg * K". Received "${str}".`)
	const strSplit = str.split('/')
	if (strSplit.length > 2) throw new Error(`Invalid unit input: only one divider "/" is allowed. Received "${str}".`)
	return { numerator: strSplit[0], denominator: strSplit[1] ?? '' }
}

// Turn a unit string like 'kg * m^2 * s' (without slashes) or an array of unit element inputs into an array of UnitElements.
export function asUnitElementArray(input: UnitElementArrayInput): UnitElementArray {
	// On a string, split it into parts.
	if (typeof input === 'string') {
		input = input.trim()
		if (input === '' || input === '1') return []
		input = input.split('*').map(part => part.trim()).filter(part => part !== '')
	}

	// Turn all elements into UnitElements.
	return input.map(unitElement => asUnitElement(unitElement))
}
