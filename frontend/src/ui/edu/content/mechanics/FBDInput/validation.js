import { areLoadsEqual, isLoadAtPoint } from 'step-wise/edu/exercises/util/engineeringMechanics'

import { selectRandomEmpty } from 'util/feedbackMessages'

// These are validation functions.
export function nonEmpty(data) {
	if (data.length === 0)
		return selectRandomEmpty()
}
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
			text: 'Sommige belastingen zijn dubbel getekend. Zorg dat alle belastingen uniek zijn.',
			affectedLoads: [data[doubleLoadIndex], data[otherIndex]],
		}
	}
}
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
				text: `${(unconnectedLoads.length === 1 ? 'Er is een belasting die niet gekoppeld is aan een bekend punt.' : 'Er zijn belastingen die niet gekoppeld zijn aan een bekend punt.')} Dit kan dus nooit een correct antwoord zijn.`,
				affectedLoads: unconnectedLoads,
			}
		}
	}
}