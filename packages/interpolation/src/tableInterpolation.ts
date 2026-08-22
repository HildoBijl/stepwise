import { fromKeys, hasDuplicates, isNumber, isPlainObject } from '@step-wise/js-utils'

import type { InterpolationValue, InterpolationTable, TableInterpolationInput, TableInterpolationOutput, InterpolationAxis, InterpolationSeries } from './types'
import { compareInterpolationValues, isNumberLike } from './checks'
import { interpolateValidatedGrid } from './gridInterpolation'

// Find a single value in a table, either because the table only has one output, or because an output label is indicated.
export function interpolateTable<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: InputType,
	table: InterpolationTable<InputType, OutputType>,
	outputLabel?: string,
): OutputType | undefined
export function interpolateTable<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: readonly InputType[],
	table: InterpolationTable<InputType, OutputType>,
	outputLabel?: string,
): OutputType | undefined
export function interpolateTable<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: Record<string, InputType>,
	table: InterpolationTable<InputType, OutputType>,
	outputLabel?: string,
): OutputType | undefined
export function interpolateTable<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: TableInterpolationInput<InputType>,
	table: InterpolationTable<InputType, OutputType>,
	outputLabel?: string,
): OutputType | undefined {
	const normalizedInput = normalizeTableInterpolationInput(input, table)
	const outputIndex = getOutputGridIndex(table, outputLabel)
	return interpolateValidatedGrid(normalizedInput, table.outputGrids[outputIndex], table.inputAxes)
}

// Find multiple output values in a table.
export function interpolateTableOutputs<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: InputType,
	table: InterpolationTable<InputType, OutputType>,
	outputLabels?: readonly string[],
): TableInterpolationOutput<OutputType>
export function interpolateTableOutputs<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: readonly InputType[],
	table: InterpolationTable<InputType, OutputType>,
	outputLabels?: readonly string[],
): TableInterpolationOutput<OutputType>
export function interpolateTableOutputs<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: Record<string, InputType>,
	table: InterpolationTable<InputType, OutputType>,
	outputLabels?: readonly string[],
): TableInterpolationOutput<OutputType>
export function interpolateTableOutputs<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: TableInterpolationInput<InputType>,
	table: InterpolationTable<InputType, OutputType>,
	outputLabels?: readonly string[],
): TableInterpolationOutput<OutputType> {
	const normalizedInput = normalizeTableInterpolationInput(input, table)
	const selectedOutputLabels = outputLabels ?? table.outputLabels
	if (hasDuplicates(selectedOutputLabels)) throw new RangeError(`Interpolation error: duplicate output labels are not allowed in a request.`)
	return fromKeys(selectedOutputLabels, label => interpolateValidatedGrid(normalizedInput, table.outputGrids[getOutputGridIndex(table, label)], table.inputAxes))
}

export function interpolateTableInput<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	output: OutputType,
	table: InterpolationTable<InputType, OutputType>,
	outputLabel?: string,
): InputType | undefined {
	// Check that the table is one-dimensional.
	if (table.inputAxes.length !== 1) throw new RangeError(`Interpolation error: inverse interpolation requires exactly one input parameter, but received ${table.inputAxes.length}.`)

	// Find the output grid.
	const outputIndex = getOutputGridIndex(table, outputLabel)
	const outputSeries = table.outputGrids[outputIndex] as InterpolationSeries<OutputType>
	const inputAxis = table.inputAxes[0]

	// Check that the selected output grid is one-dimensional.
	if (!Array.isArray(outputSeries)) throw new TypeError(`Interpolation error: inverse interpolation requires a one-dimensional output grid.`)
	if (outputSeries.some(value => Array.isArray(value))) throw new RangeError(`Interpolation error: inverse interpolation requires a one-dimensional output grid.`)
	if (outputSeries.length !== inputAxis.length) throw new RangeError(`Interpolation error: the input axis and output series must have matching lengths.`)
	if (outputSeries.some(value => value === undefined)) throw new RangeError(`Interpolation error: inverse interpolation cannot use an output series containing undefined values.`)

	// Check monotonicity, then interpolate with input and output swapped.
	const definedOutputSeries = outputSeries as InterpolationAxis<OutputType>
	validateMonotonicSeries(definedOutputSeries)
	const [interpolationInputAxis, interpolationOutputSeries] = isDescendingSeries(definedOutputSeries) ? [[...definedOutputSeries].reverse(), [...inputAxis].reverse()] : [definedOutputSeries, inputAxis]
	return interpolateValidatedGrid([output], interpolationOutputSeries, [interpolationInputAxis])
}

function normalizeTableInterpolationInput<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(input: TableInterpolationInput<InputType>, table: InterpolationTable<InputType, OutputType>): readonly InputType[] {
	// On an array, check the length and return it.
	if (Array.isArray(input)) {
		if (input.length !== table.inputAxes.length) throw new RangeError(`Interpolation error: expected ${table.inputAxes.length} input values, but received ${input.length}.`)
		return [...input]
	}

	// On an object, turn into an array with values in the right order.
	if (isPlainObject(input)) {
		return table.inputLabels.map(label => {
			if (!Object.hasOwn(input, label)) throw new TypeError(`Interpolation error: missing input value for label "${label}".`)
			return input[label]
		})
	}

	// On a single value, check if this matches the table.
	if (isNumber(input) || isNumberLike(input)) {
		if (table.inputAxes.length !== 1) throw new RangeError(`Interpolation error: single input values are only allowed for single-input tables.`)
		return [input as InputType]
	}

	throw new TypeError(`Interpolation error: unexpected input type "${typeof input}".`)
}

function getOutputGridIndex<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(table: InterpolationTable<InputType, OutputType>, outputLabel?: string): number {
	// On no output label, the table must have only one output.
	if (outputLabel === undefined) {
		if (table.outputLabels.length !== 1) throw new RangeError(`Interpolation error: the table has ${table.outputLabels.length} outputs; an output label is required.`)
		return 0
	}

	// Find the corresponding output label in the table output labels.
	const index = table.outputLabels.indexOf(outputLabel)
	if (index === -1) throw new Error(`Interpolation error: unknown output label "${outputLabel}".`)
	return index
}

function isDescendingSeries<T extends InterpolationValue<T>>(series: InterpolationAxis<T>): boolean {
	return compareInterpolationValues(series[1], series[0]) < 0
}

function validateMonotonicSeries<T extends InterpolationValue<T>>(series: InterpolationAxis<T>): void {
	if (series.length < 2) throw new RangeError(`Interpolation error: inverse interpolation requires at least two output values.`)
	let direction: -1 | 1 | undefined
	for (let i = 1; i < series.length; i++) {
		const comparison = compareInterpolationValues(series[i], series[i - 1])
		if (comparison === 0) throw new RangeError(`Interpolation error: inverse interpolation requires a strictly monotonic output series, but equal neighboring values were found at indices ${i - 1} and ${i}.`)
		const currentDirection = comparison > 0 ? 1 : -1
		direction ??= currentDirection
		if (currentDirection !== direction) throw new RangeError(`Interpolation error: inverse interpolation requires a monotonic output series, but its direction changes near index ${i}.`)
	}
}
