import { isNumber } from '../../primitives'

import type { NumberLike, InterpolationValue, InterpolationPair } from './types'

// Assemble the default input range for interpolation.
export function getDefaultInterpolationRange<T extends InterpolationValue>(value: T): InterpolationPair<T> {
	if (value === undefined || value === null) return [0, 1] as [T, T]
	if (isNumber(value)) return [0, 1] as [T, T]
	return [value.multiply(0), value.multiply(0).add(1)] as [T, T]
}

// Get the interpolation part of an input within a range.
export function getInterpolationPart<T extends InterpolationValue>(input: T, range = getDefaultInterpolationRange<T>(input)): number {
	// Check the inputs.
	if (!Array.isArray(range) || range.length !== 2) throw new TypeError(`Interpolate error: the input range was not an array of size 2. Instead, we received "${JSON.stringify(range)}".`)
	if (isNumber(input) !== isNumber(range[0]) || isNumber(input) !== isNumber(range[1])) throw new TypeError(`Invalid interpolation input: the input value must be of the same type as the input range, but this is not the case. The input value is "${input}" but the input range is [${range.join(', ')}].`)

	// For numbers use arithmetics.
	if (isNumber(input)) return (input - (range[0] as number)) / ((range[1] as number) - (range[0] as number))

	// For objects use function calls.
	const a = range[0] as NumberLike
	const b = range[1] as NumberLike
	return input.subtract(a).divide(b.subtract(a)).number
}

// Check if the given interpolation part is valid.
export function isValidInterpolationPart(part: number): boolean {
	return part >= 0 && part <= 1
}

// Find the two closest indices in an ascending series using binary search.
export function getClosestIndices<InputType extends InterpolationValue>(value: InputType, getSeriesValue: (index: number) => InputType, seriesLength: number): [number, number] {
	let min = 0
	let max = seriesLength - 1
	while (max - min > 1) {
		const trial = Math.floor((max + min) / 2)
		const comparisonValue = getSeriesValue(trial)
		if (isNumber(value) ? value < (comparisonValue as number) : value.compare(comparisonValue) < 0) max = trial
		else min = trial
	}
	return [min, max]
}
