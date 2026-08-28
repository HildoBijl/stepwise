import { hasDuplicates, isNumber } from '@step-wise/js-utils'

import type { NumberLike, InterpolationValue as InputValue, InterpolationAxis, InterpolationGrid, InterpolationTableDefinition } from './types.ts'

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

export function compareInterpolationValues<T extends InputValue<T>>(a: T, b: T): number {
	if (isNumber(a) && isNumber(b)) return a - b
	if (isNumberLike<T>(a) && isNumberLike<T>(b)) return a.compare(b)
	throw new TypeError(`Interpolation error: values use incompatible interpolation types.`)
}

// Check if the given interpolation part is valid.
export function isInterpolationFraction(fraction: number): boolean {
	return fraction >= 0 && fraction <= 1
}

// Check if a value is an array of interpolation values.
export function isInterpolationAxis<InputType extends InputValue<InputType>>(x: unknown): x is InterpolationAxis<InputType> {
	if (!Array.isArray(x) || x.length === 0 || !x.every(value => isInterpolationValue<InputType>(value))) return false
	return x.every((value, index) => {
		if (index === 0) return true
		const previousValue = x[index - 1]
		if (isNumber(value) !== isNumber(previousValue)) return false
		if (isNumber(value)) return value >= (previousValue as number)
		return isNumberLike<InputType>(value) && value.compare(previousValue as InputType) >= 0
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
export function doesGridMatchInputAxes<InputType extends InputValue<InputType>, OutputType extends InputValue<OutputType>>(grid: InterpolationGrid<OutputType>, inputAxes: readonly InterpolationAxis<InputType>[]): boolean {
	if (!isInterpolationGrid<OutputType>(grid)) return false
	const checkLevel = (node: unknown, depth: number): boolean => {
		// Final level: must be a leaf interpolation value.
		if (depth === inputAxes.length) return node === undefined || isInterpolationValue<OutputType>(node)

		// Intermediate level: must be an array with matching length.
		if (!Array.isArray(node)) return false
		const inputDimension = inputAxes.length - depth - 1
		if (node.length !== inputAxes[inputDimension].length) return false

		// Check children.
		return node.every(child => checkLevel(child, depth + 1))
	}
	return checkLevel(grid, 0)
}

// Check if a value is a valid interpolation table.
export function isInterpolationTable<InputType extends InputValue<InputType>, OutputType extends InputValue<OutputType>>(x: unknown): x is InterpolationTableDefinition<InputType, OutputType> {
	if (typeof x !== 'object' || x === null) return false
	const obj = x as Record<string, unknown>

	// Check input values.
	if (!Array.isArray(obj.inputAxes)) return false
	const inputAxes = obj.inputAxes as InterpolationAxis<InputType>[]
	if (!inputAxes.every(inputAxis => isInterpolationAxis<InputType>(inputAxis))) return false

	// Check input labels.
	if (!Array.isArray(obj.inputLabels) || !obj.inputLabels.every(label => typeof label === 'string')) return false
	if (obj.inputLabels.length !== inputAxes.length) return false
	if (hasDuplicates(obj.inputLabels)) return false

	// Check provided grids.
	if (!('outputGrids' in obj)) return false
	if (!Array.isArray(obj.outputGrids)) return false
	const outputGrids = obj.outputGrids as InterpolationGrid<OutputType>[]
	if (outputGrids.length === 0) return false
	if (!outputGrids.every(grid => doesGridMatchInputAxes(grid, inputAxes))) return false

	// Check output labels.
	if (!Array.isArray(obj.outputLabels) || !obj.outputLabels.every(label => typeof label === 'string')) return false
	if (obj.outputLabels.length !== outputGrids.length) return false
	if (hasDuplicates(obj.outputLabels)) return false

	return true
}
