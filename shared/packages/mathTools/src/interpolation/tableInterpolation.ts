import type { InterpolationValue, InterpolationInputSeries, InterpolationTable } from './types'
import { ensureInterpolationTable } from './checks'
import { gridInterpolate } from './gridInterpolation'

// Interpolate within a table. A table is an object of the form { grid: [ ... ], headers: [ ... ], ... }. Here, if the headers parameter has n sub-arrays (ranges), then the grid must be an n-dimensional array to match. Identically, the input must be an array with values for these n parameters. (If n = 1, a single input value may be given instead of an array.)
export function tableInterpolate<InputType extends InterpolationValue, OutputType extends InterpolationValue>(
	input: InputType,
	table: InterpolationTable<InputType, OutputType>
): OutputType | undefined
export function tableInterpolate<InputType extends InterpolationValue, OutputType extends InterpolationValue>(
	input: readonly InputType[],
	table: InterpolationTable<InputType, OutputType>
): OutputType | undefined
export function tableInterpolate<InputType extends InterpolationValue, OutputType extends InterpolationValue>(
	input: InputType | readonly InputType[],
	table: InterpolationTable<InputType, OutputType>
): OutputType | undefined {
	return gridInterpolate<InputType, OutputType>(input as any, table.grid, ...table.headers)
}

// Inverse interpolation in a 1D table.
export function inverseTableInterpolate<InputType extends InterpolationValue, OutputType extends InterpolationValue>(
	output: OutputType,
	table: InterpolationTable<InputType, OutputType>
): InputType | undefined {
	// Check the input.
	ensureInterpolationTable(table)
	if (table.headers.length !== 1) throw new RangeError(`Interpolation error: can only apply inverse table interpolation on a table with one input parameter. However, the given table has ${table.headers.length}.`)
	if (table.grid.some(v => v === undefined)) throw new Error(`Interpolation error: cannot run inverse table interpolation on tables with undefined values.`)

	// Run an interpolation flipping the headers and the grid.
	return gridInterpolate<OutputType, InputType>(output, table.headers[0], table.grid as InterpolationInputSeries<OutputType>)
}
