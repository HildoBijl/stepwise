import type { InterpolationValue, InterpolationInputSeries, InterpolationOutputSeries, InterpolationGrid } from './types'
import { doesGridMatchinputValues, isInterpolationGrid, isInterpolationInputSeries, isInterpolationValue } from './checks'
import { compareInterpolationValues, getClosestIndices } from './support'
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
	const inputs = Array.isArray(input) ? input : [input]
	validateGridInputs(inputs, inputSeries)
	if (!inputSeries.every(series => isInterpolationInputSeries<InputType>(series))) throw new RangeError(`Interpolation error: every input series must be non-empty and ascending.`)
	if (!isInterpolationGrid<OutputType>(outputSeries)) throw new TypeError(`Interpolation error: the output grid must contain finite interpolation values of one type.`)
	if (!doesGridMatchinputValues(outputSeries as InterpolationGrid<OutputType>, inputSeries)) throw new RangeError(`Interpolation error: the output grid dimensions must match the input series.`)
	return gridInterpolateRecursive(inputs, outputSeries as InterpolationGrid<OutputType>, inputSeries)
}

export function interpolateTrustedGrid<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	inputs: readonly InputType[],
	outputGrid: InterpolationGrid<OutputType>,
	inputSeries: readonly InterpolationInputSeries<InputType>[],
): OutputType | undefined {
	validateGridInputs(inputs, inputSeries)
	return gridInterpolateRecursive(inputs, outputGrid, inputSeries)
}

function validateGridInputs<InputType extends InterpolationValue<InputType>>(inputs: readonly InputType[], inputSeries: readonly InterpolationInputSeries<InputType>[]): void {
	if (inputs.length === 0) throw new RangeError(`Interpolation error: at least one input value is required.`)
	if (inputs.some(value => !isInterpolationValue<InputType>(value))) throw new TypeError(`Interpolation error: every input must be a finite interpolation value.`)
	if (inputSeries.length !== inputs.length) throw new RangeError(`Interpolation error: expected ${inputs.length} input series, but received ${inputSeries.length}.`)
}

function gridInterpolateRecursive<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: readonly InputType[],
	outputSeries: InterpolationGrid<OutputType>,
	inputSeries: readonly InterpolationInputSeries<InputType>[],
): OutputType | undefined {
	if (input.length === 1) return gridInterpolateSingleValue(input[0], outputSeries as InterpolationOutputSeries<OutputType>, inputSeries[0])

	// Reduce the problem to one with one parameter less: examine the last input variable.
	const params: InputType[] = [...input]
	const remainingInputSeries: InterpolationInputSeries<InputType>[] = [...inputSeries]
	const param = params.pop() as InputType
	const paramInputSeries = remainingInputSeries.pop() as InterpolationInputSeries<InputType>

	// Check the output table.
	if (!Array.isArray(outputSeries)) throw new TypeError(`Interpolation error: the output grid must be an array.`)
	if (paramInputSeries.length !== outputSeries.length) throw new RangeError(`Interpolation error: the output grid dimensions must match the input series.`)

	// Find the right interval and interpolate within it.
	const [min, max] = getClosestIndices(param, index => paramInputSeries[index], paramInputSeries.length)
	ensureCoordinateIsUnambiguous(param, paramInputSeries, min, max)
	if (compareInterpolationValues(param, paramInputSeries[min]) === 0) return gridInterpolateRecursive(params, outputSeries[min] as InterpolationGrid<OutputType>, remainingInputSeries)
	if (compareInterpolationValues(param, paramInputSeries[max]) === 0) return gridInterpolateRecursive(params, outputSeries[max] as InterpolationGrid<OutputType>, remainingInputSeries)
	if (min === max) return undefined
	const vMin = gridInterpolateRecursive(params, outputSeries[min] as InterpolationGrid<OutputType>, remainingInputSeries)
	const vMax = gridInterpolateRecursive(params, outputSeries[max] as InterpolationGrid<OutputType>, remainingInputSeries)
	if (vMin === undefined || vMax === undefined) return undefined
	return rangeInterpolate(param, [vMin, vMax], [paramInputSeries[min], paramInputSeries[max]])
}

function gridInterpolateSingleValue<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: InputType,
	outputSeries: InterpolationOutputSeries<OutputType>,
	inputSeries: InterpolationInputSeries<InputType>,
): OutputType | undefined {
	// Check input and output series.
	if (!Array.isArray(inputSeries)) throw new TypeError(`Interpolation error: the input series must be an array.`)
	if (!Array.isArray(outputSeries)) throw new TypeError(`Interpolation error: the output series must be an array.`)
	if (inputSeries.length !== outputSeries.length) throw new RangeError(`Interpolation error: the input and output series must have matching lengths.`)

	// Find indices on the input series, and interpolate for these indices.
	const [min, max] = getClosestIndices(input, index => inputSeries[index], inputSeries.length)
	ensureCoordinateIsUnambiguous(input, inputSeries, min, max)
	if (compareInterpolationValues(input, inputSeries[min]) === 0) return ensureGridOutputValue(outputSeries[min])
	if (compareInterpolationValues(input, inputSeries[max]) === 0) return ensureGridOutputValue(outputSeries[max])
	if (min === max) return undefined
	if (outputSeries[min] === undefined || outputSeries[max] === undefined) return undefined
	return rangeInterpolate(input, [outputSeries[min], outputSeries[max]], [inputSeries[min], inputSeries[max]])
}

function ensureCoordinateIsUnambiguous<InputType extends InterpolationValue<InputType>>(input: InputType, inputSeries: InterpolationInputSeries<InputType>, ...candidateIndices: number[]): void {
	for (const index of candidateIndices) {
		if (compareInterpolationValues(input, inputSeries[index]) !== 0) continue
		const matchesPrevious = index > 0 && compareInterpolationValues(inputSeries[index], inputSeries[index - 1]) === 0
		const matchesNext = index < inputSeries.length - 1 && compareInterpolationValues(inputSeries[index], inputSeries[index + 1]) === 0
		if (matchesPrevious || matchesNext) throw new RangeError(`Interpolation error: the input exactly matches a duplicated coordinate and therefore has an ambiguous output.`)
	}
}

function ensureGridOutputValue<OutputType extends InterpolationValue<OutputType>>(value: OutputType | undefined): OutputType | undefined {
	if (value !== undefined && !isInterpolationValue<OutputType>(value)) throw new TypeError(`Interpolation error: output values must be finite interpolation values.`)
	return value
}
