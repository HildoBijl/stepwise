import { ensureInt, ensureNumber } from '../numbers'

// Create an array with numbers from start (inclusive) to end (inclusive). If only one parameter is given, it is treated as the end and start is 0.
export function integerRange(end: number): number[]
export function integerRange(start: number, end: number): number[]
export function integerRange(start: number, end?: number): number[] {
	if (end === undefined) {
		end = start
		start = 0
	}
	if (start <= end)	return [...Array(end - start + 1).keys()].map(x => x + start)
	return [...Array(start - end + 1).keys()].map(x => start - x)
}

// Create points start + i*step for i=0..numPoints-1.
export function rangeByStep(start: number, step: number, numPoints: number): number[] {
	numPoints = ensureInt(numPoints, true, true)
	return integerRange(0, numPoints - 1).map(i => start + i * step)
}

// Create an array from start to end with numSteps steps (n steps → n+1 points).
export function range(start: number, end: number, numSteps: number): number[] {
	numSteps = ensureInt(numSteps, true, true)
	const step = (end - start) / numSteps
	return rangeByStep(start, step, numSteps + 1)
}

// Create an array from start to end with the given step.
export function spread(start: number, end: number, step: number = 1): number[] {
	step = ensureNumber(step, false, true)
	if (start === end) return [start]
	if (Math.sign(end - start) !== Math.sign(step)) {
		const temp = end
		end = start
		start = temp
	}
	const numPoints = Math.floor((end - start) / step) + 1
	return rangeByStep(start, step, numPoints)
}
