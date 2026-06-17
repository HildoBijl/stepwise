import type { InterpolationValue, InterpolationInputSeries, InterpolationOutputSeries, InterpolationGrid } from './types'
import { getClosestIndices } from './support'
import { rangeInterpolate } from './rangeInterpolation'

export function gridInterpolate<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: InputType,
	outputSeries: InterpolationOutputSeries<OutputType>,
	inputSeries: InterpolationInputSeries<InputType>,
): OutputType | undefined
export function gridInterpolate<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: readonly InputType[],
	outputSeries: InterpolationGrid<OutputType>,
	...inputSeries: InterpolationInputSeries<InputType>[]
): OutputType | undefined
export function gridInterpolate<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: InputType | readonly InputType[],
	outputSeries: InterpolationOutputSeries<OutputType> | InterpolationGrid<OutputType>,
	...inputSeries: InterpolationInputSeries<InputType>[]
): OutputType | undefined {
	// In the single-parameter case, interpolate directly.
	if (!Array.isArray(input) || input.length === 1) {
		if (inputSeries.length > 1) throw new RangeError(`Grid interpolate error: too many parameters.`)
		return gridInterpolateSingleValue(Array.isArray(input) ? input[0] : input, outputSeries as InterpolationOutputSeries<OutputType>, inputSeries[0])
	}

	// Check the input parameters.
	if (input.length === 0) throw new TypeError(`Grid interpolate error: received an empty array as input.`)
	if (inputSeries.length !== input.length) throw new RangeError(`Grid interpolate error: incorrect number of input series given. Expected ${input.length} input series, but received ${inputSeries.length}.`)

	// Reduce the problem to one with one parameter less: examine the last input variable.
	const params: InputType[] = [...input]
	const remainingInputSeries: InterpolationInputSeries<InputType>[] = [...inputSeries]
	const param = params.pop() as InputType
	const paramInputSeries = remainingInputSeries.pop() as InterpolationInputSeries<InputType>

	// Check the output table.
	if (!Array.isArray(outputSeries)) throw new TypeError(`Grid interpolate error: the outputSeries parameter must be an array.`)
	if (paramInputSeries.length !== outputSeries.length) throw new RangeError(`Grid interpolate error: incorrect size of the output table. The input series of the last parameter has ${paramInputSeries.length} entries, but the output table has ${outputSeries.length} elements.`)

	// Find the right interval and interpolate within it.
	const [min, max] = getClosestIndices(param, index => paramInputSeries[index], paramInputSeries.length)
	const vMin = gridInterpolate(params, outputSeries[min] as InterpolationGrid<OutputType>, ...remainingInputSeries)
	const vMax = gridInterpolate(params, outputSeries[max] as InterpolationGrid<OutputType>, ...remainingInputSeries)
	if (vMin === undefined || vMax === undefined) return undefined
	return rangeInterpolate(param, [vMin, vMax], [paramInputSeries[min], paramInputSeries[max]])
}

function gridInterpolateSingleValue<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: InputType,
	outputSeries: InterpolationOutputSeries<OutputType>,
	inputSeries: InterpolationInputSeries<InputType>,
): OutputType | undefined {
	// Check input and output series.
	if (!Array.isArray(inputSeries)) throw new TypeError(`Grid interpolate error: the input series was not an array.`)
	if (!Array.isArray(outputSeries)) throw new TypeError(`Grid interpolate error: the output series was not an array.`)
	if (inputSeries.length !== outputSeries.length) throw new RangeError(`Grid interpolate error: the input series and output series do not have matching lengths. The input series has length ${inputSeries.length} while the output series has length ${outputSeries.length}.`)

	// Find indices on the input series, and interpolate for these indices.
	const [min, max] = getClosestIndices(input, index => inputSeries[index], inputSeries.length)
	if (outputSeries[min] === undefined || outputSeries[max] === undefined) return undefined
	return rangeInterpolate(input, [outputSeries[min], outputSeries[max]], [inputSeries[min], inputSeries[max]])
}
