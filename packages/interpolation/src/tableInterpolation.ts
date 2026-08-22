import { fromKeys, hasDuplicates, isNumber, isPlainObject } from '@step-wise/js-utils'

import type { InterpolationValue, InterpolationTable, TableInterpolationInput, TableInterpolationOutput, InterpolationInputSeries, InterpolationOutputSeries } from './types'
import { isNumberLike } from './checks'
import { compareInterpolationValues, ensureMonotonicSeries } from './support'
import { interpolateTrustedGrid } from './gridInterpolation'

// Find a single value in a table, either because the table only has one output, or because an output label is indicated.
export function tableInterpolate<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: InputType,
	table: InterpolationTable<InputType, OutputType>,
	outputLabel?: string,
): OutputType | undefined
export function tableInterpolate<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: readonly InputType[],
	table: InterpolationTable<InputType, OutputType>,
	outputLabel?: string,
): OutputType | undefined
export function tableInterpolate<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: Record<string, InputType>,
	table: InterpolationTable<InputType, OutputType>,
	outputLabel?: string,
): OutputType | undefined
export function tableInterpolate<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: TableInterpolationInput<InputType>,
	table: InterpolationTable<InputType, OutputType>,
	outputLabel?: string,
): OutputType | undefined {
	const normalizedInput = normalizeTableInterpolationInput(input, table)
	const outputIndex = getOutputIndex(table, outputLabel)
	return interpolateTrustedGrid(normalizedInput, table.grids[outputIndex], table.inputValues)
}

// Find multiple output values in a table.
export function multiOutputTableInterpolate<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: InputType,
	table: InterpolationTable<InputType, OutputType>,
	outputLabels?: readonly string[],
): TableInterpolationOutput<OutputType>
export function multiOutputTableInterpolate<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: readonly InputType[],
	table: InterpolationTable<InputType, OutputType>,
	outputLabels?: readonly string[],
): TableInterpolationOutput<OutputType>
export function multiOutputTableInterpolate<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: Record<string, InputType>,
	table: InterpolationTable<InputType, OutputType>,
	outputLabels?: readonly string[],
): TableInterpolationOutput<OutputType>
export function multiOutputTableInterpolate<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	input: TableInterpolationInput<InputType>,
	table: InterpolationTable<InputType, OutputType>,
	outputLabels?: readonly string[],
): TableInterpolationOutput<OutputType> {
	const normalizedInput = normalizeTableInterpolationInput(input, table)
	const selectedOutputLabels = outputLabels ?? table.outputLabels
	if (hasDuplicates(selectedOutputLabels)) throw new RangeError(`Interpolation error: duplicate output labels are not allowed in a request.`)
	return fromKeys(selectedOutputLabels, label => interpolateTrustedGrid(normalizedInput, table.grids[getOutputIndex(table, label)], table.inputValues))
}

export function inverseTableInterpolate<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(
	output: OutputType,
	table: InterpolationTable<InputType, OutputType>,
	outputLabel?: string,
): InputType | undefined {
	// Check that the table is one-dimensional.
	if (table.inputValues.length !== 1) throw new RangeError(`Interpolation error: inverse interpolation requires exactly one input parameter, but received ${table.inputValues.length}.`)

	// Find the output grid.
	const outputIndex = getOutputIndex(table, outputLabel)
	const outputSeries = table.grids[outputIndex] as InterpolationOutputSeries<OutputType>
	const inputSeries = table.inputValues[0]

	// Check that the selected output grid is one-dimensional.
	if (!Array.isArray(outputSeries)) throw new TypeError(`Interpolation error: inverse interpolation requires a one-dimensional output grid.`)
	if (outputSeries.some(value => Array.isArray(value))) throw new RangeError(`Interpolation error: inverse interpolation requires a one-dimensional output grid.`)
	if (outputSeries.length !== inputSeries.length) throw new RangeError(`Interpolation error: the input and output series must have matching lengths.`)
	if (outputSeries.some(value => value === undefined)) throw new RangeError(`Interpolation error: inverse interpolation cannot use an output series containing undefined values.`)

	// Check monotonicity, then interpolate with input and output swapped.
	const definedOutputSeries = ensureMonotonicSeries(outputSeries as InterpolationInputSeries<OutputType>)
	const [interpolationInputSeries, interpolationOutputSeries] = isDescendingSeries(definedOutputSeries) ? [[...definedOutputSeries].reverse(), [...inputSeries].reverse()] : [definedOutputSeries, inputSeries]
	return interpolateTrustedGrid([output], interpolationOutputSeries, [interpolationInputSeries])
}

function normalizeTableInterpolationInput<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(input: TableInterpolationInput<InputType>, table: InterpolationTable<InputType, OutputType>): readonly InputType[] {
	// On an array, check the length and return it.
	if (Array.isArray(input)) {
		if (input.length !== table.inputValues.length) throw new RangeError(`Interpolation error: expected ${table.inputValues.length} input values, but received ${input.length}.`)
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
		if (table.inputValues.length !== 1) throw new RangeError(`Interpolation error: single input values are only allowed for single-input tables.`)
		return [input as InputType]
	}

	throw new TypeError(`Interpolation error: unexpected input type "${typeof input}".`)
}

function getOutputIndex<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>>(table: InterpolationTable<InputType, OutputType>, outputLabel?: string): number {
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

function isDescendingSeries<T extends InterpolationValue<T>>(series: InterpolationInputSeries<T>): boolean {
	return compareInterpolationValues(series[1], series[0]) < 0
}
