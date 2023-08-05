import { areLoadsEqual, isLoadAtPoint } from 'step-wise/edu/exercises/util/engineeringMechanics'

import { selectRandomEmpty } from 'util/feedbackMessages'

// nonEmpty requires at least one load.
export function nonEmpty(data) {
	if (data.length === 0)
		return selectRandomEmpty()
}

// nonEmptyNoDoubles checks that there are no duplicates in the loads.
export function nonEmptyNoDoubles(data) {
	// Check for empty.
	const nonEmptyValidation = nonEmpty(data)
	if (nonEmptyValidation)
		return nonEmptyValidation

	// Check for doubles.
	const getEqualLoadIndex = (index) => data.findIndex((load, loadIndex) => index !== loadIndex && areLoadsEqual(data[index], load))
	const doubleLoadIndex = data.findIndex((_, index) => getEqualLoadIndex(index) !== -1)
	if (doubleLoadIndex !== -1) {
		const otherIndex = getEqualLoadIndex(doubleLoadIndex)
		return {
			text: 'Sommige pijlen zijn dubbel getekend. Zorg dat alle pijlen uniek zijn.',
			affectedLoads: [data[doubleLoadIndex], data[otherIndex]],
		}
	}
}

// allConnectedToPoints is a validation-function-generating function. It gets the points to check and returns a validation function. This validation function first checks that there are no duplicates, and then ensures that all loads are connected to at least one of the given points.
export function allConnectedToPoints(points) {
	return (data) => {
		// Check basic problems.
		const nonEmptyNoDoublesValidation = nonEmptyNoDoubles(data)
		if (nonEmptyNoDoublesValidation)
			return nonEmptyNoDoublesValidation

		// Find a non-connected load.
		const unconnectedLoads = data.filter(load => !Object.values(points).some(point => isLoadAtPoint(load, point)))
		if (unconnectedLoads.length > 0) {
			return {
				text: `${(unconnectedLoads.length === 1 ? 'Er is een pijl die niet gekoppeld is aan een bekend punt.' : 'Er zijn pijlen die niet gekoppeld zijn aan een bekend punt.')} Dit kan dus nooit een correct antwoord zijn.`,
				affectedLoads: unconnectedLoads,
			}
		}
	}
}
