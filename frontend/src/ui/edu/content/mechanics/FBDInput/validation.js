import { areLoadsEqual, isLoadAtPoint } from 'step-wise/edu/exercises/util/engineeringMechanics'

import { Translation, Plurals } from 'i18n'

import { selectRandomEmpty } from 'ui/edu/exercises/feedbackMessages'

export const translationPath = 'eduContent/mechanics/tools/FBDInput'

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
			text: <Translation path={translationPath} entry="feedback.doubleArrows">Some arrows have been drawn multiple times. Make sure that all arrows are unique.</Translation>,
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
				text: <Translation path={translationPath} entry="feedback.unconnectedLoads"><Plurals value={unconnectedLoads.length}><Plurals.One>There is an arrow that is</Plurals.One><Plurals.NotOne>There are arrows that are</Plurals.NotOne></Plurals> not connected to any known point, so this can never be a correct solution.</Translation>,
				affectedLoads: unconnectedLoads,
			}
		}
	}
}
