import { isNumber } from '../../primitives'

import type { NumberLike, InterpolationValue, InterpolationInputSeries, InterpolationGrid, InterpolationTable } from './types'

// Check if a value is a number-like object.
export function isNumberLike(x: unknown): x is NumberLike {
	if (typeof x !== 'object' || x === null) return false

	const obj = x as Record<string, unknown>
	if (typeof obj.number !== 'number') return false

	const funcs = ['add', 'subtract', 'multiply', 'divide', 'compare'] as const
	return funcs.every(func => typeof obj[func] === 'function')
}

// Check if a value is valid for interpolation.
export function isInterpolationValue(x: unknown): x is InterpolationValue {
	return isNumber(x) || isNumberLike(x)
}

// Ensure the given value is a number or number-like object.
export function ensureInterpolationValue(x: unknown): InterpolationValue {
	if (!isInterpolationValue(x)) throw new TypeError(`Invalid parameter: expected a number or number-like object (with add/subtract/multiply/divide functions). Instead received "${JSON.stringify(x)}".`)
	return x
}

// Check if the given interpolation part is valid.
export function isValidInterpolationPart(part: number): boolean {
	return part >= 0 && part <= 1
}

// Check if a value is an array of interpolation values.
export function isInterpolationInputSeries(x: unknown): x is InterpolationInputSeries<InterpolationValue> {
	return Array.isArray(x) && x.every(value => isInterpolationValue(value))
}

// Check that a grid matches the header dimensions.
export function doesGridMatchHeaders(grid: InterpolationGrid<InterpolationValue>, headers: readonly InterpolationInputSeries<InterpolationValue>[]): boolean {
	const checkLevel = (node: unknown, depth: number): boolean => {
		// Final level: must be a leaf interpolation value.
		if (depth === headers.length) return isInterpolationValue(node)

		// Intermediate level: must be an array with matching length.
		if (!Array.isArray(node)) return false
		if (node.length !== headers[depth].length) return false

		// Check children.
		return node.every(child => checkLevel(child, depth + 1))
	}
	return checkLevel(grid, 0)
}

// Check if a value is a valid interpolation table.
export function isInterpolationTable(x: unknown): x is InterpolationTable<InterpolationValue, InterpolationValue> {
	if (typeof x !== 'object' || x === null) return false

	const obj = x as Record<string, unknown>
	if (!Array.isArray(obj.headers)) return false

	const headers = obj.headers as InterpolationInputSeries<InterpolationValue>[]
	if (!headers.every(header => isInterpolationInputSeries(header))) return false

	if (!('grid' in obj)) return false
	if (!Array.isArray(obj.grid)) return false
	const grid = obj.grid as InterpolationGrid<InterpolationValue>

	return doesGridMatchHeaders(grid, headers)
}

// Ensure a value is a valid interpolation table.
export function ensureInterpolationTable(table: unknown): InterpolationTable<InterpolationValue, InterpolationValue> {
	if (!isInterpolationTable(table)) throw new TypeError(`Interpolation error: invalid table received.`)
	return table
}
