import { isNumber } from '@step-wise/utils'

import type { NumberLike, InterpolationValue, InterpolationPair, InterpolationInputSeries } from './types'
import { isNumberLike } from './checks'

// Get the interpolation part of an input within a range.
export function getInterpolationPart(input: number, range: InterpolationPair<number>): number
export function getInterpolationPart<InputType extends NumberLike<InputType>>(input: InputType, range: InterpolationPair<InputType>): number
export function getInterpolationPart<InputType extends NumberLike<InputType>>(input: number | InputType, range: InterpolationPair<number> | InterpolationPair<InputType>): number {
	// Check the inputs.
	if (!Array.isArray(range) || range.length !== 2) throw new TypeError(`Interpolate error: the input range was not an array of size 2. Instead, we received "${JSON.stringify(range)}".`)
	if (isNumber(input) !== isNumber(range[0]) || isNumber(input) !== isNumber(range[1])) throw new TypeError(`Invalid interpolation input: the input value must be of the same type as the input range, but this is not the case. The input value is "${input}" but the input range is [${range.join(', ')}].`)

	// Find the interpolation part depending on the type.
	if (isNumber(input)) {
		const [a, b] = range as InterpolationPair<number>
		return (input - a) / (b - a)
	}
	if (isNumberLike<InputType>(input)) {
		const [a, b] = range as InterpolationPair<InputType>
		return input.subtract(a).divide(b.subtract(a)).number
	}
	throw new Error(`Invalid getInterpolationPart case: received an input that is neither a number nor number-like.`)
}

// Find the two closest indices in an ascending series using binary search. If the value is out of range, it will still give the two closest indices (being the first two or last two).
export function getClosestIndices<InputType extends InterpolationValue<InputType>>(value: InputType, getSeriesValue: (index: number) => InputType, seriesLength: number): [number, number] {
	let min = 0
	let max = seriesLength - 1
	while (max - min > 1) {
		const trial = Math.floor((max + min) / 2)
		const comparisonValue = getSeriesValue(trial)
		if (isNumber(value) ? value < (comparisonValue as number) : value.compare(comparisonValue as InputType) < 0) max = trial
		else min = trial
	}
	return [min, max]
}

export function interpolateNumberFromPart(outputRange: InterpolationPair<number>, part: number): number {
	const [a, b] = outputRange
	return a + part * (b - a)
}

export function interpolateNumberLikeFromPart<OutputType extends NumberLike<OutputType>>(outputRange: InterpolationPair<OutputType>, part: number): OutputType {
	const [a, b] = outputRange
	return a.add(b.subtract(a).multiply(part))
}

export function compareInterpolationValues<T extends InterpolationValue<T>>(a: T, b: T): number {
	if (typeof a === 'number' && typeof b === 'number') return a - b
	if (isNumberLike<T>(a) && isNumberLike<T>(b)) return a.compare(b)
	throw new Error(`Inverse table interpolate error: output series contains mixed interpolation value types.`)
}

export function ensureMonotonicSeries<T extends InterpolationValue<T>>(series: InterpolationInputSeries<T>): InterpolationInputSeries<T> {
	if (series.length < 2) throw new Error(`Inverse table interpolate error: expected at least two output values.`)
	let direction: -1 | 1 | undefined
	for (let i = 1; i < series.length; i++) {
		const comparison = compareInterpolationValues(series[i], series[i - 1])
		if (comparison === 0) throw new Error(`Inverse table interpolate error: output series must be strictly monotonic, but equal neighboring values were found at indices ${i - 1} and ${i}.`)
		const currDirection = comparison > 0 ? 1 : -1
		direction ??= currDirection
		if (currDirection !== direction) throw new Error(`Inverse table interpolate error: output series must be monotonic, but direction changes near index ${i}.`)
	}
	return series
}
