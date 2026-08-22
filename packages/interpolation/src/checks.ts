import { hasDuplicates, isNumber } from '@step-wise/js-utils'

import type { NumberLike, InterpolationValue as InputValue, InterpolationInputSeries, InterpolationGrid, InterpolationTable } from './types'

// Check if a value is a number-like object.
export function isNumberLike<T>(x: unknown): x is NumberLike<T> {
	if (typeof x !== 'object' || x === null) return false

	const obj = x as Record<string, unknown>
	if (typeof obj.number !== 'number' || !Number.isFinite(obj.number)) return false

	const funcs = ['add', 'subtract', 'multiply', 'divide', 'compare'] as const
	return funcs.every(func => typeof obj[func] === 'function')
}

// Check if a value is valid for interpolation.
export function isInterpolationValue<T>(x: unknown): x is InputValue<T> {
	return isNumber(x) ? Number.isFinite(x) : isNumberLike<T>(x)
}

// Ensure the given value is a number or number-like object.
export function ensureInterpolationValue<T>(x: unknown): InputValue<T> {
	if (!isInterpolationValue<T>(x)) throw new TypeError(`Invalid parameter: expected a number or number-like object (with add/subtract/multiply/divide functions). Instead received "${JSON.stringify(x)}".`)
	return x
}

// Check if the given interpolation part is valid.
export function isValidInterpolationPart(part: number): boolean {
	return part >= 0 && part <= 1
}

// Check if a value is an array of interpolation values.
export function isInterpolationInputSeries<InputType extends InputValue<InputType>>(x: unknown): x is InterpolationInputSeries<InputType> {
	if (!Array.isArray(x) || x.length === 0 || !x.every(value => isInterpolationValue<InputType>(value))) return false
	return x.every((value, index) => {
		if (index === 0) return true
		const previousValue = x[index - 1]
		if (isNumber(value) !== isNumber(previousValue)) return false
		if (isNumber(value)) return value >= (previousValue as number)
		return isNumberLike<InputType>(value) && (value.number === (previousValue as NumberLike<InputType>).number || value.compare(previousValue as InputType) >= 0)
	})
}

// Check that a grid matches the input dimensions.
export function isInterpolationGrid<OutputType extends InputValue<OutputType>>(grid: unknown): grid is InterpolationGrid<OutputType> {
	if (!Array.isArray(grid)) return false
	let outputUsesNumbers: boolean | undefined
	const checkNode = (node: unknown): boolean => {
		if (Array.isArray(node)) return node.every(checkNode)
		if (node === undefined) return true
		if (!isInterpolationValue<OutputType>(node)) return false
		const usesNumbers = isNumber(node)
		outputUsesNumbers ??= usesNumbers
		return outputUsesNumbers === usesNumbers
	}
	return checkNode(grid)
}

// Check that a grid matches the input dimensions.
export function doesGridMatchinputValues<InputType extends InputValue<InputType>, OutputType extends InputValue<OutputType>>(grid: InterpolationGrid<OutputType>, inputValues: readonly InterpolationInputSeries<InputType>[]): boolean {
	if (!isInterpolationGrid<OutputType>(grid)) return false
	const checkLevel = (node: unknown, depth: number): boolean => {
		// Final level: must be a leaf interpolation value.
		if (depth === inputValues.length) return node === undefined || isInterpolationValue<OutputType>(node)

		// Intermediate level: must be an array with matching length.
		if (!Array.isArray(node)) return false
		const inputDimension = inputValues.length - depth - 1
		if (node.length !== inputValues[inputDimension].length) return false

		// Check children.
		return node.every(child => checkLevel(child, depth + 1))
	}
	return checkLevel(grid, 0)
}

// Check if a value is a valid interpolation table.
export function isInterpolationTable<InputType extends InputValue<InputType>, OutputType extends InputValue<OutputType>>(x: unknown): x is InterpolationTable<InputType, OutputType> {
	if (typeof x !== 'object' || x === null) return false
	const obj = x as Record<string, unknown>

	if (!Array.isArray(obj.inputValues)) return false
	const inputValues = obj.inputValues as InterpolationInputSeries<InputType>[]
	if (!inputValues.every(inputValueSeries => isInterpolationInputSeries<InputType>(inputValueSeries))) return false

	if (!Array.isArray(obj.inputLabels) || !obj.inputLabels.every(label => typeof label === 'string')) return false
	if (obj.inputLabels.length !== inputValues.length) return false
	if (hasDuplicates(obj.inputLabels)) return false

	if (!('grids' in obj)) return false
	if (!Array.isArray(obj.grids)) return false
	const grids = obj.grids as InterpolationGrid<OutputType>[]
	if (grids.length === 0) return false
	if (!grids.every(grid => doesGridMatchinputValues(grid, inputValues))) return false

	if (!Array.isArray(obj.outputLabels) || !obj.outputLabels.every(label => typeof label === 'string')) return false
	if (obj.outputLabels.length !== grids.length) return false
	if (hasDuplicates(obj.outputLabels)) return false

	return true
}

// Ensure a value is a valid interpolation table.
export function ensureInterpolationTable<InputType extends InputValue<InputType>, OutputType extends InputValue<OutputType>>(table: unknown): InterpolationTable<InputType, OutputType> {
	if (!isInterpolationTable<InputType, OutputType>(table)) throw new TypeError(`Interpolation error: invalid table received.`)
	return table
}
