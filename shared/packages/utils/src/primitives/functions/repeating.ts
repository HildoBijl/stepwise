import { ensureInt } from '../numbers'

// Repeat the given function the given number of times and return the outcomes.
export function repeat<T>(times: number, fn: (index: number) => T): T[] {
	times = ensureInt(times, true)
	return repeatFromTo(0, times - 1, fn)
}

// Repeat a function for indices from min to max (both inclusive) and return the outcomes. If a non-function value is given, that value is repeated as-is.
export function repeatFromTo<T>(min: number, max: number, fn: (index: number) => T): T[]
export function repeatFromTo<T>(min: number, max: number, value: T): T[]
export function repeatFromTo<T>(min: number, max: number, fnOrValue: ((index: number) => T) | T): T[] {
	min = ensureInt(min)
	max = ensureInt(max)

	const times = max - min + 1
	if (times < 0) throw new RangeError(`Repeat error: needed to repeat a function a number of ${times} times, but this is impossible.`)

	const fn = typeof fnOrValue === 'function' ? fnOrValue as (index: number) => T : () => fnOrValue
	return new Array(times).fill(0).map((_, index) => fn(index + min))
}

// Repeat the given function over a multidimensional index range starting at zero.
export function repeatMultidimensional<T>(times: readonly number[], fn: (...indices: number[]) => T): unknown {
	times = times.map(v => ensureInt(v, true))
	return repeatMultidimensionalFromTo(times.map(() => 0), times.map(num => num - 1), fn)
}

// Repeat the given function over a multidimensional index range and return a nested array of outcomes.
export function repeatMultidimensionalFromTo<T>(min: readonly number[], max: readonly number[], fn: (...indices: number[]) => T, previousValues: readonly number[] = []): unknown {
	if (min.length !== max.length) throw new RangeError(`Invalid min and max arrays: expected equal lengths, but got ${min.length} and ${max.length}.`)
	if (min.length === 0) return fn(...previousValues)

	const minValue = ensureInt(min[0])
	const maxValue = ensureInt(max[0])
	return repeatFromTo(minValue, maxValue, value => repeatMultidimensionalFromTo(min.slice(1), max.slice(1), fn, [...previousValues, value]))
}
