
import { loadTypes, getLoadMatching } from 'step-wise/edu/exercises/util/engineeringMechanics'

import { getCountingWord } from 'util/language'
import { selectRandomCorrect } from 'util/feedbackMessages'

export function getFBDFeedback(input, solution, comparison, points) {
	// Set up a matching of loads, so we can give feedback on it.
	const matching = getLoadMatching(input, solution, comparison)

	// Check if any input loads are not matched.
	const unmatchedInputLoads = input.filter((_, index) => matching.input[index].length === 0)
	if (unmatchedInputLoads.length > 0) {
		return {
			correct: false,
			text: unmatchedInputLoads.length === 1 ? 'Er is een pijl getekend die niet aanwezig hoort te zijn. Kijk daar eerst naar.' : `Er zijn ${getCountingWord(unmatchedInputLoads.length)} pijlen getekend die niet aanwezig horen te zijn. Kijk daar eerst naar.`,
			affectedLoads: unmatchedInputLoads,
		}
	}

	// Check if any solution load is matched to multiple input loads.
	const doubleInputLoads = matching.solution.filter(matches => matches.length > 1)
	if (doubleInputLoads.length >= 1) {
		return {
			correct: false,
			text: `${doubleInputLoads.length === 1 ? `Er is een set` : `Er zijn ${getCountingWord(doubleInputLoads.length)} sets`} pijlen die op hetzelfde neerkomen. Haal overbodige pijlen weg.`,
			affectedLoads: doubleInputLoads.flat(),
		}
	}

	// Check if solution loads are not matched.
	const missingLoads = solution.filter((_, index) => matching.solution[index].length === 0)
	if (missingLoads.length >= 1) {
		// Try to find a point matching a missing arrow.
		const pointName = findRelatedPoint(missingLoads[0], points)
		return {
			correct: false,
			text: `${missingLoads.length === 1 ? `Er is nog een ontbrekende pijl. Kijk eens goed naar punt ${pointName}.` : `Er zijn nog ontbrekende pijlen. Kijk eerst eens goed naar punt ${pointName}.`}`,
		}
	}

	// All is correct!
	return { correct: true, text: selectRandomCorrect() }
}

// findRelatedPoint checks which point a load belongs to, so it can be mentioned for feedback.
export function findRelatedPoint(load, points) {
	return Object.keys(points).find(name => isConnectedToPoint(load, points[name]))
}

// isConnectedToPoint checks if a load is connected to a given point.
export function isConnectedToPoint(load, point) {
	switch (load.type) {
		case loadTypes.force:
			return load.positionedVector.hasPoint(point)
		case loadTypes.moment:
			return load.position.equals(point)
		default:
			throw new Error(`Invalid load type: did not recognize a load of type "${load.type}".`)
	}
}