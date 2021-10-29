import { ensureInt } from './numbers'

export function noop() { }

// repeat will repeat the given function the given number of times. The function is passed the index (0, 1, ..., (times-1)) as parameter. Negative times will throw an error.
export function repeat(times, func) {
	repeatWithIndices(0, times - 1, func)
}

// repeatWithIndices will repeat the given function with indices ranging from min to max (both inclusive). So repeatWithIndices(3, 5, print) will print 3, 4 and 5. If min is larger than max, an error will be thrown.
export function repeatWithIndices(min, max, func) {
	// Proces input.
	min = ensureInt(min)
	max = ensureInt(max)
	const times = max - min + 1
	if (times < 0)
		throw new Error(`Repeat error: needed to repeat a function a number of ${times} times, but this is impossible.`)
	if (times === 0)
		return

	// Iterate using an impromptu array.
	const arr = (new Array(times)).fill(0)
	arr.forEach((_, index) => func(index + min))
}
