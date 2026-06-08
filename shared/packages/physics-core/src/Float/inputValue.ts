import { isPlainObject, InterpretationError } from '@step-wise/utils'

import { Float } from './Float'
import { getSignificantDigits } from './interpreting'

export type FloatInputValue = {
	number?: string
	power?: string
}

export function isFloatInputValue(value: unknown): value is FloatInputValue {
	if (!isPlainObject(value) || Object.keys(value).filter(key => !['number', 'power'].includes(key)).length > 0) return false
	const { number, power } = value as FloatInputValue
	return (number === undefined || typeof number === 'string') && (power === undefined || typeof power === 'string')
}

export function interpretFloatInputValue(value: FloatInputValue): Float {
	const storageValue = inputValueToStorageValue(value)
	return new Float(storageValue)
}

function inputValueToStorageValue(value: FloatInputValue) {
	// Validate the input.
	let { number, power } = value
	if (number === '' || number === undefined) throw new InterpretationError('Could not interpret an empty string into a number.', 'Empty')
	if (number === '-' || number === '-.') throw new InterpretationError('Could not interpret a number consisting of only a minus sign.', 'MinusSign')
	if (number === '.') throw new InterpretationError('Could not interpret a number consisting of only a decimal separator.', 'DecimalSeparator')
	if (power === '-') throw new InterpretationError('Could not interpret a power consisting of only a minus sign.', 'MinusSign')

	// Interpret the input.
	power = power === undefined || power === '' ? '0' : power
	const parsedPower = parseInt(power)
	return {
		number: parseFloat(number) * Math.pow(10, parsedPower),
		significantDigits: getSignificantDigits(number),
		power: parsedPower,
	}
}

export function floatToInputValue(float: Float): FloatInputValue {
	const power = float.getDisplayPower()
	return {
		number: float.getDisplayNumber(power),
		...(power === 0 ? {} : { power: power.toString() }),
	}
}
