import { isObject } from '../../primitives'
import type { InterpolationValue, InterpolationInputSeries, InterpolationOutputSeries } from './types'
import { gridInterpolate } from './gridInterpolation'

// Column-based interpolation table.
export type ColumnInterpolationTable<ValueType extends InterpolationValue> = Record<string, InterpolationOutputSeries<ValueType>>

// Interpolate within a column table.
export function columnTableInterpolate<ValueType extends InterpolationValue>(
	input: ValueType,
	inputLabel: string,
	table: ColumnInterpolationTable<ValueType>,
	outputLabel: string
): ValueType | undefined
export function columnTableInterpolate<ValueType extends InterpolationValue>(
	input: ValueType,
	inputLabel: string,
	table: ColumnInterpolationTable<ValueType>,
	outputLabels?: readonly string[]
): Record<string, ValueType | undefined>
export function columnTableInterpolate<ValueType extends InterpolationValue>(
	input: ValueType,
	inputLabel: string,
	table: ColumnInterpolationTable<ValueType>,
	outputLabels?: string | readonly string[]
): ValueType | undefined | Record<string, ValueType | undefined> {
	// Verify the table and input label.
	if (!isObject(table)) throw new TypeError(`Interpolation error: invalid table received. It was not an object.`)
	if (!inputLabel || !table[inputLabel] || !Array.isArray(table[inputLabel])) throw new RangeError(`Interpolation error: invalid input label "${inputLabel}" received. It was not a column of the given column table.`)

	// Verify the output labels.
	const originalOutputLabels = outputLabels
	const labels = outputLabels === undefined ? Object.keys(table) : (Array.isArray(outputLabels) ? [...outputLabels] : [outputLabels])
	labels.forEach(outputLabel => {
		if (!outputLabel || !table[outputLabel] || !Array.isArray(table[outputLabel])) throw new RangeError(`Interpolation error: invalid output label "${outputLabel}" received. It was not a column of the given column table.`)
	})

	// For each output label, interpolate the corresponding value.
	const result: Record<string, ValueType | undefined> = {}
	labels.forEach(outputLabel => {
		if (inputLabel === outputLabel) result[outputLabel] = input
		else result[outputLabel] = gridInterpolate<ValueType, ValueType>(input, table[outputLabel], table[inputLabel] as InterpolationInputSeries<ValueType>)
	})

	// Return a single value when a single output label was given.
	if (typeof originalOutputLabels === 'string') return result[originalOutputLabels]
	return result
}
