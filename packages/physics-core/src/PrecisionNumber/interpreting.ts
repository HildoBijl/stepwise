import { isPlainObject, hasOnlyKeys, ensureInteger, ensureNumber } from '@step-wise/js-utils'

export const PrecisionNumberType = 'PrecisionNumber'
export type PrecisionNumberType = typeof PrecisionNumberType

export type PrecisionNumberStorageValue = {
	number: number
	significantDigits: number | 'Infinity'
	power?: number
}

type ResolvedPrecisionNumberStorageValue = Omit<PrecisionNumberStorageValue, 'significantDigits'> & { significantDigits: number }

export type PrecisionNumberInput = string | number | PrecisionNumberStorageValue

export const defaultPrecisionNumberStorageValue: PrecisionNumberStorageValue = {
	number: 0,
	significantDigits: Infinity,
}

export const numberPattern = '(-?((\\d+[.,]?\\d*)|(\\d*[.,]?\\d+)))'
export const timesPattern = '(\\s*\\*\\s*)'
export const tenPowerPattern = '(10\\^((\\((-?\\d+)\\))|(-?\\d+)))'
export const precisionNumberPattern = `(${numberPattern}${timesPattern}${tenPowerPattern}|${tenPowerPattern}|${numberPattern})`

export const numberRegex = new RegExp(`^${numberPattern}$`)
export const precisionNumberRegex = new RegExp(`^${precisionNumberPattern}$`)

export function isNumberString(str: string): boolean {
	return numberRegex.test(str)
}

// Turn any PrecisionNumber constructor input into a complete PrecisionNumberStorageValue.
export function precisionNumberInputToStorageValue(input: PrecisionNumberInput = defaultPrecisionNumberStorageValue): ResolvedPrecisionNumberStorageValue {
	if (typeof input === 'string') return ensurePrecisionNumberStorageValue(stringToPrecisionNumberStorageValue(input))
	if (typeof input === 'number') return ensurePrecisionNumberStorageValue(numberToPrecisionNumberStorageValue(input))
	return ensurePrecisionNumberStorageValue(input)
}

// Turn a string of a precisionNumber, like '031.41500' into a PrecisionNumberStorageValue { number: 31.415, significantDigits: 7, power: 0 }.
export function stringToPrecisionNumberStorageValue(str: string): PrecisionNumberStorageValue {
	// Check the format.
	const match = precisionNumberRegex.exec(str.trim())
	if (!match) throw new Error(`Invalid PrecisionNumber string: could not parse "${str}".`)

	// Interpret the format.
	const numberStr = (match[2] || match[17] || '').replace(',', '.')
	const power = parseInt(match[10] || match[11] || match[15] || match[16] || '0')
	if (numberStr === '') return { number: Math.pow(10, power), significantDigits: Infinity, power }
	return { number: parseFloat(numberStr) * Math.pow(10, power), significantDigits: countSignificantDigits(numberStr), power }
}

// Check for a string how many significant digits there are.
export function countSignificantDigits(str: string): number {
	if (!isNumberString(str)) throw new Error(`Invalid number string: could not get significant digits from "${str}".`)
	const digits = str.replace(/[,.-]+/g, '').split('')
	if (digits.every(digit => digit === '0')) return digits.length
	return digits.length - digits.findIndex(digit => digit !== '0')
}

// Turn a number into a PrecisionNumberStorageValue. Numbers are assumed to be exact.
export function numberToPrecisionNumberStorageValue(number: number): PrecisionNumberStorageValue {
	return {
		number,
		significantDigits: Infinity,
	}
}

// Check if a PrecisionNumberStorageValue has valid parameter values.
export function ensurePrecisionNumberStorageValue(value: unknown): ResolvedPrecisionNumberStorageValue {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['number', 'significantDigits', 'power'])) throw new TypeError(`Invalid PrecisionNumberStorageValue: expected an object containing only "number", "significantDigits" and optionally "power".`)
	const { number, significantDigits, power } = value
	return {
		number: ensureNumber(number),
		significantDigits: ensureInteger(significantDigits === 'Infinity' ? Infinity : significantDigits, { nonNegative: true, allowInfinity: true }),
		...(power === undefined ? {} : { power: ensureInteger(power) }),
	}
}
