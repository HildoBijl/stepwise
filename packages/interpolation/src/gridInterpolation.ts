import { isNumber } from '@step-wise/js-utils'

import type { InterpolationValue, InterpolationAxis, InterpolationSeries, InterpolationGrid } from './types'
import { compareInterpolationValues, doesGridMatchInputAxes, isInterpolationGrid, isInterpolationAxis, isInterpolationValue } from './checks'
import { interpolateRange } from './rangeInterpolation'

export function interpolateGrid<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: InputType,
	outputSeries: InterpolationSeries<OutputType>,
	inputAxis: InterpolationAxis<InputType>,
): OutputType | undefined
export function interpolateGrid<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: readonly InputType[],
	outputSeries: InterpolationGrid<OutputType>,
	...inputAxes: InterpolationAxis<InputType>[]
): OutputType | undefined
export function interpolateGrid<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: InputType | readonly InputType[],
	outputSeries: InterpolationSeries<OutputType> | InterpolationGrid<OutputType>,
	...inputAxes: InterpolationAxis<InputType>[]
): OutputType | undefined {
	const inputs = Array.isArray(input) ? input : [input]
	validateInterpolationInputs(inputs, inputAxes)
	if (!inputAxes.every(axis => isInterpolationAxis<InputType>(axis))) throw new RangeError(`Interpolation error: every input axis must be non-empty and ascending.`)
	if (!isInterpolationGrid<OutputType>(outputSeries)) throw new TypeError(`Interpolation error: the output grid must contain finite interpolation values of one type.`)
	if (!doesGridMatchInputAxes(outputSeries as InterpolationGrid<OutputType>, inputAxes)) throw new RangeError(`Interpolation error: the output grid dimensions must match the input axes.`)
	return interpolateGridRecursive(inputs, outputSeries as InterpolationGrid<OutputType>, inputAxes)
}

export function interpolateValidatedGrid<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	inputs: readonly InputType[],
	outputGrid: InterpolationGrid<OutputType>,
	inputAxes: readonly InterpolationAxis<InputType>[],
): OutputType | undefined {
	validateInterpolationInputs(inputs, inputAxes)
	return interpolateGridRecursive(inputs, outputGrid, inputAxes)
}

function validateInterpolationInputs<InputType extends InterpolationValue<InputType>>(inputs: readonly InputType[], inputAxes: readonly InterpolationAxis<InputType>[]): void {
	if (inputs.length === 0) throw new RangeError(`Interpolation error: at least one input value is required.`)
	if (inputs.some(value => !isInterpolationValue<InputType>(value))) throw new TypeError(`Interpolation error: every input must be a finite interpolation value.`)
	if (inputAxes.length !== inputs.length) throw new RangeError(`Interpolation error: expected ${inputs.length} input axes, but received ${inputAxes.length}.`)
}

function interpolateGridRecursive<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: readonly InputType[],
	outputSeries: InterpolationGrid<OutputType>,
	inputAxes: readonly InterpolationAxis<InputType>[],
): OutputType | undefined {
	if (input.length === 1) return interpolateSeries(input[0], outputSeries as InterpolationSeries<OutputType>, inputAxes[0])

	// Reduce the problem to one with one parameter less: examine the last input variable.
	const params: InputType[] = [...input]
	const remainingInputAxes: InterpolationAxis<InputType>[] = [...inputAxes]
	const param = params.pop() as InputType
	const paramInputAxis = remainingInputAxes.pop() as InterpolationAxis<InputType>

	// Find the right interval and interpolate within it.
	const [min, max] = getBracketingIndices(param, index => paramInputAxis[index], paramInputAxis.length)
	ensureCoordinateIsUnambiguous(param, paramInputAxis, min, max)
	if (compareInterpolationValues(param, paramInputAxis[min]) === 0) return interpolateGridRecursive(params, outputSeries[min] as InterpolationGrid<OutputType>, remainingInputAxes)
	if (compareInterpolationValues(param, paramInputAxis[max]) === 0) return interpolateGridRecursive(params, outputSeries[max] as InterpolationGrid<OutputType>, remainingInputAxes)
	if (min === max) return undefined
	const vMin = interpolateGridRecursive(params, outputSeries[min] as InterpolationGrid<OutputType>, remainingInputAxes)
	const vMax = interpolateGridRecursive(params, outputSeries[max] as InterpolationGrid<OutputType>, remainingInputAxes)
	if (vMin === undefined || vMax === undefined) return undefined
	return interpolateRange(param, [vMin, vMax], [paramInputAxis[min], paramInputAxis[max]])
}

function interpolateSeries<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: InputType,
	outputSeries: InterpolationSeries<OutputType>,
	inputAxis: InterpolationAxis<InputType>,
): OutputType | undefined {
	// Find indices on the input axis, and interpolate for these indices.
	const [min, max] = getBracketingIndices(input, index => inputAxis[index], inputAxis.length)
	ensureCoordinateIsUnambiguous(input, inputAxis, min, max)
	if (compareInterpolationValues(input, inputAxis[min]) === 0) return outputSeries[min]
	if (compareInterpolationValues(input, inputAxis[max]) === 0) return outputSeries[max]
	if (min === max) return undefined
	if (outputSeries[min] === undefined || outputSeries[max] === undefined) return undefined
	return interpolateRange(input, [outputSeries[min], outputSeries[max]], [inputAxis[min], inputAxis[max]])
}

function ensureCoordinateIsUnambiguous<InputType extends InterpolationValue<InputType>>(input: InputType, inputAxis: InterpolationAxis<InputType>, ...candidateIndices: number[]): void {
	for (const index of candidateIndices) {
		if (compareInterpolationValues(input, inputAxis[index]) !== 0) continue
		const matchesPrevious = index > 0 && compareInterpolationValues(inputAxis[index], inputAxis[index - 1]) === 0
		const matchesNext = index < inputAxis.length - 1 && compareInterpolationValues(inputAxis[index], inputAxis[index + 1]) === 0
		if (matchesPrevious || matchesNext) throw new RangeError(`Interpolation error: the input exactly matches a duplicated coordinate and therefore has an ambiguous output.`)
	}
}

export function getBracketingIndices<InputType extends InterpolationValue<InputType>>(value: InputType, getAxisValue: (index: number) => InputType, axisLength: number): [number, number] {
	if (!Number.isSafeInteger(axisLength) || axisLength <= 0) throw new RangeError(`Interpolation error: axisLength must be a positive safe integer.`)
	let min = 0
	let max = axisLength - 1
	while (max - min > 1) {
		const trial = Math.floor((max + min) / 2)
		const comparisonValue = getAxisValue(trial)
		if (isNumber(value) ? value < (comparisonValue as number) : value.compare(comparisonValue as InputType) < 0) max = trial
		else min = trial
	}
	return [min, max]
}
