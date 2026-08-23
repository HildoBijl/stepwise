import { type UnitFactorStorageValue, type UnitFactor, type UnitFactorLike, asUnitFactor, unitFactorPattern } from '../UnitFactor'

export const UnitType = 'Unit'
export type UnitType = typeof UnitType

export type UnitFactorArrayStorageValue = UnitFactorStorageValue[]
export type UnitFactorArrayInput = string | UnitFactorLike[]
export type UnitFactorArray = UnitFactor[]

export type UnitStorageValue = {
	numerator?: UnitFactorArrayStorageValue
	denominator?: UnitFactorArrayStorageValue
}

export type UnitInput = string | {
	numerator?: UnitFactorArrayInput
	denominator?: UnitFactorArrayInput
}

export const unitFactorArrayPattern = `(1|${unitFactorPattern}(\\s*\\*\\s*${unitFactorPattern})*)`
export const unitPattern = `(${unitFactorArrayPattern}(\\s*/\\s*${unitFactorArrayPattern})?|/\\s*${unitFactorArrayPattern})`

export const unitFactorArrayRegex = new RegExp(`^${unitFactorArrayPattern}$`)
export const unitRegex = new RegExp(`^${unitPattern}$`)

// Turn a string like 'kg * m / s^2' into parts based on the position of the slash.
export function splitUnitString(str: string): { numerator: string, denominator: string } {
	str = str.trim()
	if (str === '' || str === '1') return { numerator: '', denominator: '' }
	if (str.includes('(') || str.includes(')')) throw new Error(`Invalid unit input: brackets are not necessary in units. Enter them like "N * m^2 / kg * K". Received "${str}".`)
	if (!unitRegex.test(str)) throw new Error(`Invalid unit input: could not parse "${str}".`)
	const [numerator, denominator] = str.split('/').map(part => (part ?? '').trim())
	return { numerator, denominator }
}

// Turn a unit string like 'kg * m^2 * s' (without slashes) or an array of unit factor inputs into an array of UnitFactors.
export function asUnitFactorArray(input: UnitFactorArrayInput): UnitFactorArray {
	if (typeof input === 'string') {
		input = input.trim()
		if (input === '' || input === '1') return []
		if (!unitFactorArrayRegex.test(input)) throw new Error(`Invalid unit factor array input: could not parse "${input}".`)
		input = input.split('*').map(part => part.trim()).filter(part => part !== '')
	}
	return input.map(unitFactor => asUnitFactor(unitFactor))
}
