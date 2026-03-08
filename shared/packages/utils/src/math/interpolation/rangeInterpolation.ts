import { isNumber, last } from '../../primitives'

import type { NumberLike, InterpolationValue, InterpolationPair, InterpolationOutputTree } from './types'
import { ensureInterpolationValue } from './checks'
import { getDefaultInterpolationRange, getInterpolationPart, isValidInterpolationPart } from './support'

/* Apply linear (or bilinear, trilinear, etcetera) interpolation between numbers. It has various use cases, depending on the number of input parameters.
 * - For a single parameter: interpolate(V1, [Vo_1min, Vo_1max], [V1_min, V1_max]). Here Vo_1min means the output at parameter 1's minimum value. Optionally you can use [V1] instead of V1.
 * - For two parameters: interpolate([V1, V2], [[Vo_1min_2min, Vo_1max_2min], [Vo_1min_2max, Vo_1max_2max]], [V1_min, V1_max], [V2_min, V2_max]).
 * - For three parameters: interpolate([V1, V2, V3], [[[Vo_1min_2min_3min, Vo_1max_2min_3min], [Vo_1min_2max_3min, Vo_1max_2max_3min]], [[Vo_1min_2min_3max, Vo_1max_2min_3max], [Vo_1min_2max_3max, Vo_1max_2max_3max]]], [V1_min, V1_max], [V2_min, V2_max], [V3_min, V3_max]).
 * - And so forth ...
 * The first two input parameters are obligatory. If a bounds array like [V1_min, V_1max] is not given, [0, 1] will be used as default.
 * When the input does not fall within the input range, undefined is returned.
 */

export function interpolate<InputType extends InterpolationValue, OutputType extends InterpolationValue>(
	input: InputType,
	outputRange: InterpolationPair<OutputType>,
	inputRange?: InterpolationPair<InputType>
): OutputType | undefined
export function interpolate<InputType extends InterpolationValue, OutputType extends InterpolationValue>(
	input: readonly InputType[],
	outputRange: InterpolationOutputTree<OutputType>,
	...inputRange: InterpolationPair<InputType>[]
): OutputType | undefined
export function interpolate<InputType extends InterpolationValue, OutputType extends InterpolationValue>(
	input: InputType | readonly InputType[],
	outputRange: InterpolationPair<OutputType> | InterpolationOutputTree<OutputType>,
	firstInputRange?: InterpolationPair<InputType>,
	...otherInputRanges: InterpolationPair<InputType>[]
): OutputType | undefined {
	// In the single-parameter case, interpolate directly.
	if (!Array.isArray(input) || input.length === 1) {
		if (otherInputRanges.length > 0) throw new RangeError(`Interpolate error: too many parameters. We received a total of ${otherInputRanges.length + 3} parameters for the interpolate function, for a simple one-dimensional problem. A maximum of 3 parameters is expected.`)
		return interpolateSingleValue<InputType, OutputType>(Array.isArray(input) ? input[0] : input, outputRange as InterpolationPair<OutputType>, firstInputRange)
	}

	// Combine input ranges to satisfy Typescript checks.
	const inputRange = [firstInputRange, ...otherInputRanges]

	// Reduce the problem to one with one parameter less, by evaluating the last parameter.
	const params = [...input]
	if (inputRange.length > params.length) throw new RangeError(`Interpolate error: too many parameters. We received a total of ${inputRange.length + 2} parameters for the interpolate function, for a ${params.length}-dimensional problem. A maximum of ${params.length + 2} parameters is expected.`)
	const paramInputRange = inputRange.length < params.length ? getDefaultInterpolationRange(last(params)) : inputRange.pop()
	const param = ensureInterpolationValue(params.pop())

	// Check the output range while we're at it.
	if (!Array.isArray(outputRange) || outputRange.length !== 2) throw new TypeError(`Interpolate error: the output range was not an array of size 2. (These elements may be deeper arrays, depending on the dimensionality of the problem.) Instead, we received "${JSON.stringify(outputRange)}".`)

	// Interpolate for the minimum and maximum value of the current parameter.
	const vMin = interpolate<InputType, OutputType>(params, outputRange[0] as InterpolationOutputTree<OutputType>, ...inputRange as [InputType, InputType][])
	const vMax = interpolate<InputType, OutputType>(params, outputRange[1] as InterpolationOutputTree<OutputType>, ...inputRange as [InputType, InputType][])

	// Interpolate between the minimum and maximum values to get our final answer.
	return interpolateSingleValue<InputType, OutputType>(param as InputType, [vMin, vMax] as InterpolationPair<OutputType>, paramInputRange as InterpolationPair<InputType>)
}

// Interpolate for a single value.
export function interpolateSingleValue<InputType extends InterpolationValue, OutputType extends InterpolationValue>(
	input: InputType,
	outputRange: InterpolationPair<OutputType>,
	inputRange?: InterpolationPair<InputType>
): OutputType | undefined {
	// Check the input data.
	if (!Array.isArray(inputRange) || inputRange.length !== 2) throw new TypeError(`Interpolate error: the input range was not an array of size 2. Instead, we received "${JSON.stringify(inputRange)}".`)
	if (isNumber(input) !== isNumber(inputRange[0]) || isNumber(input) !== isNumber(inputRange[1])) throw new TypeError(`Interpolate error: the input value "${input}" did not have a matching type with the interpolation input values [${inputRange.join(', ')}].`)

	// Use the input to find the interpolation part.
	const part = getInterpolationPart<InputType>(input, inputRange)
	if (!isValidInterpolationPart(part)) return undefined

	// Ensure the output range is an array with two numbers.
	if (!Array.isArray(outputRange) || outputRange.length !== 2) throw new TypeError(`Interpolate error: the output range was not an array of size 2. Instead, we received "${JSON.stringify(outputRange)}".`)
	if (isNumber(outputRange[0]) !== isNumber(outputRange[1])) throw new TypeError(`Interpolate error: the interpolation output values [${outputRange.join(', ')}] did not have a matching type.`)

	// Find the output according to the output type.
	if (isNumber(outputRange[0]) && isNumber(outputRange[1])) {
		const a = outputRange[0]
		const b = outputRange[1]
		return a + part * (b - a) as OutputType
	} else {
		const a = outputRange[0] as NumberLike
		const b = outputRange[1] as NumberLike
		return a.add(b.subtract(a).multiply(part)) as OutputType
	}
}
