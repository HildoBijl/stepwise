import { isNumber } from '@step-wise/js-utils'

import type { InterpolationValue, InterpolationPair } from './types'
import { isInterpolationValue, isNumberLike, isValidInterpolationPart } from './checks'
import { getInterpolationPart, interpolateNumberFromPart, interpolateNumberLikeFromPart } from './support'

export function rangeInterpolate<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: InputType,
	outputRange: InterpolationPair<OutputType>,
	inputRange: InterpolationPair<InputType>
): OutputType | undefined {
	// Check the input data.
	if (!Array.isArray(inputRange) || inputRange.length !== 2) throw new TypeError(`Interpolate error: the input range was not an array of size 2.`)
	if (isNumber(input) !== isNumber(inputRange[0]) || isNumber(input) !== isNumber(inputRange[1])) throw new TypeError(`Interpolate error: the input value did not match the input range type.`)

	// Use the input to find the interpolation part.
	const part = getInterpolationPart(input, inputRange)
	if (!isValidInterpolationPart(part)) return undefined

	// Ensure the output range is an array with two numbers.
	if (!Array.isArray(outputRange) || outputRange.length !== 2) throw new TypeError(`Interpolate error: the output range was not an array of size 2.`)
	if (outputRange[0] === undefined || outputRange[1] === undefined) return undefined
	if (!isInterpolationValue<OutputType>(outputRange[0]) || !isInterpolationValue<OutputType>(outputRange[1])) throw new TypeError(`Interpolate error: the output range must contain finite interpolation values.`)
	if (isNumber(outputRange[0]) !== isNumber(outputRange[1])) throw new TypeError(`Interpolate error: the interpolation output values did not have a matching type.`)

	// Find the output according to the output type.
	if (isNumber(outputRange[0]) && isNumber(outputRange[1])) return interpolateNumberFromPart(outputRange as InterpolationPair<number>, part) as OutputType
	if (isNumberLike(outputRange[0]) && isNumberLike(outputRange[1])) return interpolateNumberLikeFromPart(outputRange, part)
	throw new Error(`Interpolate error: the output values did not have a type that could be interpolated upon.`)
}
