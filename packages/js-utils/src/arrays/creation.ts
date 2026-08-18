import { ensureInteger, ensureNumber } from '../numbers'

// Create an array with numbers from start (inclusive) to end (inclusive). If only one parameter is given, it is treated as the end and start is 0.
export function integerRange(end: number): number[]
export function integerRange(start: number, end: number): number[]
export function integerRange(start: number, end?: number): number[] {
	if (end === undefined) {
		end = start
		start = 0
	}
	start = ensureInteger(start)
	end = ensureInteger(end)
	if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)) throw new RangeError('Invalid integer range: start and end must be safe integers.')
	const length = Math.abs(end - start) + 1
	if (length > 0xffffffff) throw new RangeError(`Invalid integer range: requested length ${length} exceeds the maximum JavaScript array length.`)
	return Array.from({ length }, (_, index) => start <= end ? start + index : start - index)
}

// Create an arithmetic sequence start + i * step for i = 0 through length - 1.
export function arithmeticSequence(start: number, step: number, length: number): number[] {
	start = ensureNumber(start)
	step = ensureNumber(step)
	length = ensureInteger(length, { nonNegative: true, nonZero: true })
	return integerRange(0, length - 1).map(i => start + i * step)
}

// Subdivide the range from start to end into equal subdivisions, including both endpoints.
export function subdivideRange(start: number, end: number, subdivisions: number): number[] {
	start = ensureNumber(start)
	end = ensureNumber(end)
	subdivisions = ensureInteger(subdivisions, { nonNegative: true, nonZero: true })
	const step = (end - start) / subdivisions
	return arithmeticSequence(start, step, subdivisions + 1)
}

// Create an array from start to end with the given step.
export function rangeByStep(start: number, end: number, step: number = 1): number[] {
	start = ensureNumber(start)
	end = ensureNumber(end)
	step = ensureNumber(step, { nonZero: true })
	if (start === end) return [start]
	if (Math.sign(end - start) !== Math.sign(step)) throw new RangeError(`Invalid range: step ${step} does not move from ${start} toward ${end}.`)
	const numPoints = Math.floor((end - start) / step) + 1
	return arithmeticSequence(start, step, numPoints)
}
