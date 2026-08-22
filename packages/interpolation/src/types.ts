// Number-like objects used for interpolation.
export interface NumberLike<T> {
	number: number
	add(x: T): T
	subtract(x: T): T
	multiply(x: T | number): T
	divide(x: T | number): T
	compare(x: T): number
}
export type InterpolationValue<T> = number | NumberLike<T>

// Box-based interpolation.
export type InterpolationPair<T> = readonly [T, T]

// Interpolation series and grids.
export type InterpolationAxis<T> = readonly T[]
export type InterpolationSeries<T> = readonly (T | undefined)[]
export type InterpolationGrid<T> = readonly (T | undefined | InterpolationGrid<T | undefined>)[]

// Interpolation table with grid(s). Think of a 2D table with numbers along the horizontal and vertical axis, and a grid of values. We can also add multiple grids: one for each output value.
export interface InterpolationTableDefinition<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>> {
	readonly inputLabels: readonly string[]
	readonly inputAxes: readonly InterpolationAxis<InputType>[]
	readonly outputLabels: readonly string[]
	readonly outputGrids: readonly InterpolationGrid<OutputType>[]
}

declare const interpolationTableBrand: unique symbol

export interface InterpolationTable<InputType extends InterpolationValue<InputType>, OutputType extends InterpolationValue<OutputType>> extends InterpolationTableDefinition<InputType, OutputType> {
	readonly [interpolationTableBrand]: true
}
export type TableInterpolationInput<InputType> = InputType | readonly InputType[] | Record<string, InputType>
export type TableInterpolationOutput<OutputType> = Record<string, OutputType | undefined>
