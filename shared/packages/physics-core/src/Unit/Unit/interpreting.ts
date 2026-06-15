import { type UnitElementStorageValue, type UnitElement, type UnitElementLike, asUnitElement, unitElementPattern } from '../UnitElement'

export const UnitType = 'Unit'
export type UnitType = typeof UnitType

export type UnitElementArrayStorageValue = UnitElementStorageValue[]
export type UnitElementArrayInput = string | UnitElementLike[]
export type UnitElementArray = UnitElement[]

export type UnitStorageValue = {
	numerator?: UnitElementArrayStorageValue
	denominator?: UnitElementArrayStorageValue
}

export type UnitInput = string | {
	numerator?: UnitElementArrayInput
	denominator?: UnitElementArrayInput
}

export const unitElementArrayPattern = `(1|${unitElementPattern}(\\s*\\*\\s*${unitElementPattern})*)`
export const unitPattern = `${unitElementArrayPattern}(\\s*/\\s*${unitElementArrayPattern})?`

export const unitElementArrayRegex = new RegExp(`^${unitElementArrayPattern}$`)
export const unitRegex = new RegExp(`^${unitPattern}$`)

// Turn a string like 'kg * m / s^2' into parts based on the position of the slash.
export function splitUnitString(str: string): { numerator: string, denominator: string } {
	str = str.trim()
	if (str === '' || str === '1') return { numerator: '', denominator: '' }
	if (str.includes('(') || str.includes(')')) throw new Error(`Invalid unit input: brackets are not necessary in units. Enter them like "N * m^2 / kg * K". Received "${str}".`)
	if (!unitRegex.test(str)) throw new Error(`Invalid unit input: could not parse "${str}".`)
	const strSplit = str.split('/')
	return { numerator: strSplit[0].trim(), denominator: strSplit[1]?.trim() ?? '' }
}

// Turn a unit string like 'kg * m^2 * s' (without slashes) or an array of unit element inputs into an array of UnitElements.
export function asUnitElementArray(input: UnitElementArrayInput): UnitElementArray {
	if (typeof input === 'string') {
		input = input.trim()
		if (input === '' || input === '1') return []
		if (!unitElementArrayRegex.test(input)) throw new Error(`Invalid unit element array input: could not parse "${input}".`)
		input = input.split('*').map(part => part.trim()).filter(part => part !== '')
	}
	return input.map(unitElement => asUnitElement(unitElement))
}
