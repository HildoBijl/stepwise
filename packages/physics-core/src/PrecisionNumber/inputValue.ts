import { isPlainObject, InterpretationError, hasOnlyKeys } from '@step-wise/js-utils'

import { PrecisionNumber } from './PrecisionNumber'
import { countSignificantDigits } from './interpreting'

export type PrecisionNumberInputValue = {
	number?: string
	power?: string
}

export function isPrecisionNumberInputValue(value: unknown): value is PrecisionNumberInputValue {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['number', 'power'])) return false
	const { number, power } = value as PrecisionNumberInputValue
	return (number === undefined || typeof number === 'string') && (power === undefined || typeof power === 'string')
}

export function interpretPrecisionNumberInputValue(value: PrecisionNumberInputValue): PrecisionNumber {
	const storageValue = inputValueToStorageValue(value)
	return new PrecisionNumber(storageValue)
}

function inputValueToStorageValue(value: PrecisionNumberInputValue) {
	// Validate the input.
	let { number, power } = value
	if (number === '' || number === undefined) throw new InterpretationError('Could not interpret an empty string into a number.', 'Empty')
	if (number === '-' || number === '-.') throw new InterpretationError('Could not interpret a number consisting of only a minus sign.', 'MinusSign')
	if (number === '.') throw new InterpretationError('Could not interpret a number consisting of only a decimal separator.', 'DecimalSeparator')
	if (power === '-') throw new InterpretationError('Could not interpret a power consisting of only a minus sign.', 'MinusSign')

	// Interpret the input.
	power = power === undefined || power === '' ? '0' : power
	if (!/^-?\d+$/.test(power)) throw new InterpretationError(`Could not interpret the power "${power}" as an integer.`, 'InvalidPower')
	const parsedPower = parseInt(power)
	return {
		number: parseFloat(number) * Math.pow(10, parsedPower),
		significantDigits: countSignificantDigits(number),
		power: parsedPower,
	}
}

export function precisionNumberToInputValue(precisionNumber: PrecisionNumber): PrecisionNumberInputValue {
	const power = precisionNumber.getDisplayPower()
	return {
		number: precisionNumber.getDisplayNumber(power),
		...(power === 0 ? {} : { power: power.toString() }),
	}
}
