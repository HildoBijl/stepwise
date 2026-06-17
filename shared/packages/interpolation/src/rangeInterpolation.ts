import { isNumber } from '@step-wise/utils'

import type { InterpolationValue, InterpolationPair, InterpolationOutputTree } from './types'
import { isNumberLike, isValidInterpolationPart } from './checks'
import { getInterpolationPart, interpolateNumberFromPart, interpolateNumberLikeFromPart } from './support'

export function rangeInterpolate<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: InputType,
	outputRange: InterpolationPair<OutputType>,
	inputRange: InterpolationPair<InputType>
): OutputType | undefined
export function rangeInterpolate<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: readonly InputType[],
	outputRange: InterpolationOutputTree<OutputType>,
	...inputRange: InterpolationPair<InputType>[]
): OutputType | undefined
export function rangeInterpolate<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: InputType | readonly InputType[],
	outputRange: InterpolationPair<OutputType> | InterpolationOutputTree<OutputType>,
	firstInputRange: InterpolationPair<InputType>,
	...otherInputRanges: InterpolationPair<InputType>[]
): OutputType | undefined {
	// In the single-parameter case, interpolate directly.
	if (!Array.isArray(input) || input.length === 1) {
		if (otherInputRanges.length > 0) throw new RangeError(`Interpolate error: too many parameters.`)
		return rangeInterpolateSingleValue(Array.isArray(input) ? input[0] : input, outputRange as InterpolationPair<OutputType>, firstInputRange)
	}

	// Set up lists for the input parameters/ranges that we can pop from.
	const params: InputType[] = [...input]
	const inputRange: InterpolationPair<InputType>[] = [firstInputRange, ...otherInputRanges]
	if (inputRange.length !== params.length) throw new RangeError(`Interpolate error: too many parameters.`)

	// Extract the last elements of the lists.
	const param = params.pop() as InputType
	const paramInputRange = inputRange.pop() as InterpolationPair<InputType>
	if (!Array.isArray(outputRange) || outputRange.length !== 2) throw new TypeError(`Interpolate error: the output range was not an array of size 2.`)

	// Interpolate for this last value, incorporating the remaining ranges.
	const vMin = rangeInterpolate(params, outputRange[0] as InterpolationOutputTree<OutputType>, ...(inputRange as InterpolationPair<InputType>[]))
	const vMax = rangeInterpolate(params, outputRange[1] as InterpolationOutputTree<OutputType>, ...(inputRange as InterpolationPair<InputType>[]))
	if (vMin === undefined || vMax === undefined) return undefined
	return rangeInterpolateSingleValue(param, [vMin, vMax], paramInputRange)
}

export function rangeInterpolateSingleValue<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
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
	if (isNumber(outputRange[0]) !== isNumber(outputRange[1])) throw new TypeError(`Interpolate error: the interpolation output values did not have a matching type.`)

	// Find the output according to the output type.
	if (isNumber(outputRange[0]) && isNumber(outputRange[1])) return interpolateNumberFromPart(outputRange as InterpolationPair<number>, part) as OutputType
	if (isNumberLike(outputRange[0]) && isNumberLike(outputRange[1])) return interpolateNumberLikeFromPart(outputRange, part)
	throw new Error(`Interpolate error: the output values did not have a type that could be interpolated upon.`)
}
