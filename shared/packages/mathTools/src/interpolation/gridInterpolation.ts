import type { InterpolationValue, InterpolationInputSeries, InterpolationOutputSeries, InterpolationGrid } from './types'
import { getClosestIndices } from './support'
import { interpolate } from './rangeInterpolation'

/* Apply linear (or bilinear, trilinear, etcetera) interpolation between a series or grid of numbers. It has various use cases, depending on the number of input parameters.
 * - For a single parameter: gridInterpolate(V1, [Vo-series], [V1-series]). It is assumed here that the input series V1-series is in ascending order. Optionally you can use [V1] instead of V1.
 * - For two parameters: interpolate([V1, V2], [[Vo-series for first V2-value], [V1-series for second V2-value], ...], [V1-series], [V2-series]).
 * - For three parameters: interpolate([V1, V2, V3], [[Vo-table for first V3-value], [Vo-table for second V3-value], ...], [V1-series], [V2-series], [V3-series]).
 * - And so forth ...
 * An example usage would be gridInterpolate([1963, 19], [[10, 11, 12, 13], [9, 12, 14, 17], [6, 7, 9, 10]], [1950, 1960, 1970, 1980], [18, 20, 22]). All parameters are obligatory.
 * It is possible to have undefined values in the grid. When this happens, and the input falls near such a value (that is, the value is needed for the interpolation) then undefined is returned. The return value is also undefined when the input value falls outside of the grid.
 */

export function gridInterpolate<InputType extends InterpolationValue, OutputType extends InterpolationValue>(
	input: InputType,
	outputSeries: InterpolationOutputSeries<OutputType>,
	inputSeries: InterpolationInputSeries<InputType>
): OutputType | undefined
export function gridInterpolate<InputType extends InterpolationValue, OutputType extends InterpolationValue>(
	input: readonly InputType[],
	outputSeries: InterpolationGrid<OutputType>,
	...inputSeries: InterpolationInputSeries<InputType>[]
): OutputType | undefined
export function gridInterpolate<InputType extends InterpolationValue, OutputType extends InterpolationValue>(
	input: InputType | readonly InputType[],
	outputSeries: InterpolationOutputSeries<OutputType> | InterpolationGrid<OutputType>,
	...inputSeries: InterpolationInputSeries<InputType>[]
): OutputType | undefined {
	// In the single-parameter case, interpolate directly.
	if (!Array.isArray(input) || input.length === 1) {
		if (inputSeries.length > 1) throw new RangeError(`Interpolate error: too many parameters. We received a total of ${inputSeries.length + 2} parameters for the interpolate function, for a simple one-dimensional problem. A maximum of 3 parameters is expected.`)
		return gridInterpolateSingleValue<InputType, OutputType>(Array.isArray(input) ? input[0] : input, outputSeries as InterpolationOutputSeries<OutputType>, inputSeries[0])
	}

	// Check the input parameters.
	if (input.length === 0) throw new TypeError(`Grid interpolate error: received an empty array as input.`)
	if (inputSeries.length !== input.length) throw new RangeError(`Grid interpolate error: incorrect number of input series given. Expected ${input.length} input series, but received ${inputSeries.length}.`)

	// Reduce the problem to one with one parameter less: examine the last input variable.
	const params = [...input]
	if (inputSeries.length !== params.length) throw new RangeError(`Grid interpolate error: incorrect number of parameters given. A ${params.length}-dimensional problem should have ${params.length} input series given (after the input value and output table) but we received ${inputSeries.length} input series.`)
	const paramInputSeries = inputSeries.pop() as InterpolationInputSeries<InputType>
	const param = params.pop()

	// Check the output table.
	if (!Array.isArray(outputSeries)) throw new TypeError(`Grid interpolate error: the outputSeries parameter must be an array. Instead, we received "${JSON.stringify(outputSeries)}".`)
	if (paramInputSeries.length !== outputSeries.length) throw new RangeError(`Grid interpolate error: incorrect size of the output table. The input series of the last parameter has ${paramInputSeries.length} entries. Hence, the output series/table should be an array with ${paramInputSeries.length} elements (sub-tables) but it has ${outputSeries.length} elements.`)

	// Find the right interval and interpolate within it.
	const [min, max] = getClosestIndices<InputType>(param, index => paramInputSeries[index], paramInputSeries.length)
	const vMin = gridInterpolate<InputType, OutputType>(params, outputSeries[min], ...inputSeries)
	const vMax = gridInterpolate<InputType, OutputType>(params, outputSeries[max], ...inputSeries)
	if (vMin === undefined || vMax === undefined) return undefined
	return interpolate<InputType, OutputType>(param, [vMin, vMax], [paramInputSeries[min], paramInputSeries[max]])
}

// Grid interpolate for a single value.
function gridInterpolateSingleValue<InputType extends InterpolationValue, OutputType extends InterpolationValue>(
	input: InputType,
	outputSeries: InterpolationOutputSeries<OutputType>,
	inputSeries: InterpolationInputSeries<InputType>
): OutputType | undefined {
	// Check input and output series.
	if (!Array.isArray(inputSeries)) throw new TypeError(`Grid interpolate error: the input series was not an array. Instead, we received "${JSON.stringify(inputSeries)}".`)
	if (!Array.isArray(outputSeries)) throw new TypeError(`Grid interpolate error: the output series was not an array. Instead, we received "${JSON.stringify(outputSeries)}".`)
	if (inputSeries.length !== outputSeries.length) throw new RangeError(`Grid interpolate error: the input series and output series do not have matching lengths. The input series has length ${inputSeries.length} while the output series has length ${outputSeries.length}. This must be equal.`)

	// Find indices on the input series, and interpolate for these indices.
	const [min, max] = getClosestIndices<InputType>(input, index => inputSeries[index], inputSeries.length)
	if (outputSeries[min] === undefined || outputSeries[max] === undefined) return undefined
	return interpolate<InputType, OutputType>(input, [outputSeries[min], outputSeries[max]], [inputSeries[min], inputSeries[max]])
}
