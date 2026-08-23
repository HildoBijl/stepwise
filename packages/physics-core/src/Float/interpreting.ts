import { isInteger, isPlainObject, hasOnlyKeys, ensureNumber } from '@step-wise/js-utils'

export const FloatType = 'Float'
export type FloatType = typeof FloatType

export type FloatStorageValue = {
	number: number
	significantDigits: number
	power?: number
}

export type FloatInput = string | number | FloatStorageValue

export const defaultFloatStorageValue: FloatStorageValue = {
	number: 0,
	significantDigits: Infinity,
}

export const numberPattern = '(-?((\\d+[.,]?\\d*)|(\\d*[.,]?\\d+)))'
export const timesPattern = '(\\s*\\*\\s*)'
export const tenPowerPattern = '(10\\^((\\((-?\\d+)\\))|(-?\\d+)))'
export const floatPattern = `(${numberPattern}${timesPattern}${tenPowerPattern}|${tenPowerPattern}|${numberPattern})`

export const numberRegex = new RegExp(`^${numberPattern}$`)
export const floatRegex = new RegExp(`^${floatPattern}$`)

export function isNumberString(str: string): boolean {
	return numberRegex.test(str)
}

// Turn any Float constructor input into a complete FloatStorageValue.
export function floatInputToStorageValue(input: FloatInput = defaultFloatStorageValue): FloatStorageValue {
	if (typeof input === 'string') return validateFloatStorageValue(stringToFloatStorageValue(input))
	if (typeof input === 'number') return validateFloatStorageValue(numberToFloatStorageValue(input))
	return validateFloatStorageValue(input)
}

// Turn a string of a float, like '031.41500' into a FloatStorageValue { number: 31.415, significantDigits: 7, power: 0 }.
export function stringToFloatStorageValue(str: string): FloatStorageValue {
	// Check the format.
	const match = floatRegex.exec(str.trim())
	if (!match) throw new Error(`Invalid Float string: could not parse "${str}".`)

	// Interpret the format.
	const numberStr = (match[2] || match[17] || '').replace(',', '.')
	const power = parseInt(match[10] || match[11] || match[15] || match[16] || '0')
	if (numberStr === '') return { number: Math.pow(10, power), significantDigits: Infinity, power }
	return { number: parseFloat(numberStr) * Math.pow(10, power), significantDigits: getSignificantDigits(numberStr), power }
}

// Check for a string how many significant digits there are.
export function getSignificantDigits(str: string): number {
	if (!isNumberString(str)) throw new Error(`Invalid number string: could not get significant digits from "${str}".`)
	const digits = str.replace(/[,.-]+/g, '').split('')
	if (digits.every(digit => digit === '0')) return digits.length
	return digits.length - digits.findIndex(digit => digit !== '0')
}

// Turn a number into a FloatStorageValue. Numbers are assumed to be exact.
export function numberToFloatStorageValue(number: number): FloatStorageValue {
	return {
		number,
		significantDigits: Infinity,
	}
}

// Check if a FloatStorageValue has valid parameter values.
export function validateFloatStorageValue(value: unknown): FloatStorageValue {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['number', 'significantDigits', 'power'])) throw new TypeError(`Invalid FloatStorageValue: expected an object containing only "number", "significantDigits" and optionally "power".`)
	const { number, significantDigits, power } = value
	ensureNumber(number)
	if (significantDigits !== Infinity && (!isInteger(significantDigits) || significantDigits < 0)) throw new Error(`Invalid FloatStorageValue: expected "significantDigits" to be a non-negative integer or Infinity, but received "${significantDigits}".`)
	if (power !== undefined && !isInteger(power)) throw new Error(`Invalid FloatStorageValue: expected "power" to be an integer or undefined, but received "${power}".`)
	return value as FloatStorageValue
}
