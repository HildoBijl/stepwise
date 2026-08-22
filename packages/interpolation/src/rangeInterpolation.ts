import { isNumber } from '@step-wise/js-utils'

import type { NumberLike, InterpolationValue, InterpolationPair } from './types'
import { isInterpolationValue, isNumberLike, isInterpolationFraction } from './checks'

export function interpolateRange<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: InputType,
	outputRange: InterpolationPair<OutputType>,
	inputRange: InterpolationPair<InputType>
): OutputType | undefined {
	// Check the input data.
	if (!Array.isArray(inputRange) || inputRange.length !== 2) throw new TypeError(`Interpolation error: the input range must be an array of size 2.`)
	if (isNumber(input) !== isNumber(inputRange[0]) || isNumber(input) !== isNumber(inputRange[1])) throw new TypeError(`Interpolation error: the input value and input range endpoints must use the same value type.`)

	// Use the input to find the interpolation part.
	const fraction = getInterpolationFraction(input, inputRange)
	if (!isInterpolationFraction(fraction)) return undefined

	// Ensure the output range is an array with two numbers.
	if (!Array.isArray(outputRange) || outputRange.length !== 2) throw new TypeError(`Interpolation error: the output range must be an array of size 2.`)
	if (outputRange[0] === undefined || outputRange[1] === undefined) return undefined
	if (!isInterpolationValue<OutputType>(outputRange[0]) || !isInterpolationValue<OutputType>(outputRange[1])) throw new TypeError(`Interpolation error: the output range must contain finite interpolation values.`)
	if (isNumber(outputRange[0]) !== isNumber(outputRange[1])) throw new TypeError(`Interpolation error: the output range endpoints must use the same value type.`)

	// Find the output according to the output type.
	if (isNumber(outputRange[0]) && isNumber(outputRange[1])) return interpolateNumberFromFraction(outputRange as InterpolationPair<number>, fraction) as OutputType
	if (isNumberLike(outputRange[0]) && isNumberLike(outputRange[1])) return interpolateNumberLikeFromFraction(outputRange, fraction)
	throw new TypeError(`Interpolation error: the output values cannot be interpolated.`)
}

export function getInterpolationFraction(input: number, range: InterpolationPair<number>): number
export function getInterpolationFraction<InputType extends NumberLike<InputType>>(input: InputType, range: InterpolationPair<InputType>): number
export function getInterpolationFraction<InputType extends NumberLike<InputType>>(input: number | InputType, range: InterpolationPair<number> | InterpolationPair<InputType>): number {
	if (!Array.isArray(range) || range.length !== 2) throw new TypeError(`Interpolation error: the input range must be an array of size 2. Instead received "${JSON.stringify(range)}".`)
	if (!isInterpolationValue<InputType>(input) || !isInterpolationValue<InputType>(range[0]) || !isInterpolationValue<InputType>(range[1])) throw new TypeError(`Interpolation error: the input value and range endpoints must be finite interpolation values.`)
	if (isNumber(input) !== isNumber(range[0]) || isNumber(input) !== isNumber(range[1])) throw new TypeError(`Interpolation error: the input value and input range endpoints must use the same value type.`)
	if (isNumber(input)) {
		const [a, b] = range as InterpolationPair<number>
		if (a === b) throw new RangeError(`Interpolation error: the input range endpoints must differ.`)
		return (input - a) / (b - a)
	}
	if (isNumberLike<InputType>(input)) {
		const [a, b] = range as InterpolationPair<InputType>
		if (a.compare(b) === 0) throw new RangeError(`Interpolation error: the input range endpoints must differ.`)
		return input.subtract(a).divide(b.subtract(a)).number
	}
	throw new TypeError(`Interpolation error: the input must be a number or number-like object.`)
}

function interpolateNumberFromFraction(outputRange: InterpolationPair<number>, fraction: number): number {
	const [a, b] = outputRange
	return a + fraction * (b - a)
}

function interpolateNumberLikeFromFraction<OutputType extends NumberLike<OutputType>>(outputRange: InterpolationPair<OutputType>, fraction: number): OutputType {
	const [a, b] = outputRange
	return a.add(b.subtract(a).multiply(fraction))
}
