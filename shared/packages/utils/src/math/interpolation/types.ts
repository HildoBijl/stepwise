// Number-like objects used for interpolation.
export interface NumberLike {
	number: number
	add(x: NumberLike | number): NumberLike
	subtract(x: NumberLike | number): NumberLike
	multiply(x: NumberLike | number): NumberLike
	divide(x: NumberLike | number): NumberLike
	compare(x: NumberLike | number): number
}

// Types used within interpolation.
export type InterpolationValue = number | NumberLike
export type InterpolationPair<T> = readonly [T, T]
export type InterpolationOutputTree<T> = readonly [T | InterpolationOutputTree<T>, T | InterpolationOutputTree<T>]
export type InterpolationInputSeries<T> = readonly T[]
export type InterpolationOutputSeries<T> = readonly (T | undefined)[]
export type InterpolationGrid<T> = readonly (T | undefined | InterpolationGrid<T | undefined>)[]

// Interpolation table with grid and headers. Think of a 2D table with numbers along the horizontal and vertical axis, and a grid of values.
export interface InterpolationTable<InputType extends InterpolationValue, OutputType extends InterpolationValue> {
	labels: string[]
	grid: InterpolationGrid<OutputType>
	headers: InterpolationInputSeries<InputType>[]
}
