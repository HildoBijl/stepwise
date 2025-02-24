const { ensureInt, ensureNumber } = require('../numbers')

// numberArray creates an array with numbers from start (inclusive) to end (inclusive). Both must be integers. So with 3 and 5 it's [3,4,5] and with 5 and 3 it's [5,4,3]. If only one parameter is given, then this is considered the end and the start is set to zero.
function numberArray(p1, p2) {
	p1 = ensureInt(p1)
	p2 = ensureInt(p2)
	let start, end
	if (p2 === undefined) {
		start = 0
		end = p1
	} else {
		start = p1
		end = p2
	}
	if (start <= end)
		return [...Array(end - start + 1).keys()].map(x => x + start)
	return [...Array(start - end + 1).keys()].map(x => start - x)
}
module.exports.numberArray = numberArray

// range creates an array with numbers from start (inclusive) to end (inclusive) with the given number of steps. When given n steps, the array will have n+1 points. For instance, range(2, 4, 5) will give [2, 2.4, 2.8, 3.2, 3.6, 4] so it has five steps but six points.
function range(start, end, numSteps) {
	// Check input.
	start = ensureNumber(start)
	end = ensureNumber(end)
	numSteps = ensureInt(numSteps, true, true) // We need a positive number of steps.

	// Iterate.
	const step = (end - start) / numSteps
	return numberArray(0, numSteps).map(index => start + index * step)
}
module.exports.range = range

// spread creates an array with numbers from start (inclusive) to end (inclusive if possible) with the given step. So spread(5,11,2) gives [5,7,9,11] while spread(5,10,2) gives [5,7,9]. It is similar to Python's 5:11:2 (except Python does not include the end point while this function does).
function spread(start, end, step = 1) {
	// Check input.
	start = ensureNumber(start)
	end = ensureNumber(end)
	step = ensureNumber(step, false, true) // The spread may not be zero.

	// Check boundary cases.
	if (start === end)
		return [start]
	if (Math.sign(end - start) !== Math.sign(step)) {
		const temp = end
		end = start
		start = temp
	}

	// Iterate.
	const numPoints = Math.floor((end - start) / step) + 1
	return numberArray(0, numPoints - 1).map(index => start + index * step)
}
module.exports.spread = spread
