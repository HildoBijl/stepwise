
import { loadTypes, getLoadMatching } from 'step-wise/edu/exercises/util/engineeringMechanics'

import { Translation, Check, Plurals, CountingWord } from 'i18n'
import { selectRandomCorrect } from 'ui/form'

import { translationPath } from './validation'

// getFBDFeedbackFunction returns a feedback function to give feedback on Free Body Diagram inputs. It requires comparison options and a set of points to refer to when naming a point.
export function getFBDFeedbackFunction(comparison, points = {}) {
	return (input, solution) => getFBDFeedback(input, solution, comparison, points)
}

// getFBDFeedback takes an input FBD and a solution FBD and compares them to extract feedback. It requires the comparison options too, as well as an object { A: new Vector(...), ... } whose names the feedback may refer to.
export function getFBDFeedback(input, solution, comparison, points = {}) {
	// Set up a matching of loads, so we can give feedback on it.
	const matching = getLoadMatching(input, solution, comparison)

	// Check if any input loads are not matched.
	const unmatchedInputLoads = input.filter((_, index) => matching.input[index].length === 0)
	if (unmatchedInputLoads.length > 0) {
		return {
			correct: false,
			text: <Translation path={translationPath} entry="feedback.incorrectInputLoads"><Plurals value={unmatchedInputLoads.length}><Plurals.One>An arrow has been drawn that shouldn't be present.</Plurals.One><Plurals.NotOne>There are <CountingWord>{unmatchedInputLoads.length}</CountingWord> arrows that should not be present.</Plurals.NotOne></Plurals> Have a look at that first.</Translation>,
			affectedLoads: unmatchedInputLoads,
		}
	}

	// Check if any solution load is matched to multiple input loads.
	const doubleInputLoads = matching.solution.filter(matches => matches.length > 1)
	if (doubleInputLoads.length >= 1) {
		return {
			correct: false,
			text: <Translation path={translationPath} entry="feedback.doubleInputLoads"><Plurals value={doubleInputLoads.length}><Plurals.One>There is a set</Plurals.One><Plurals.NotOne>There are <CountingWord>{doubleInputLoads.length}</CountingWord> sets</Plurals.NotOne> of duplicate arrows.</Plurals> Remove the superfluous ones.</Translation>,
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
			text: <Translation path={translationPath} entry="feedback.missingLoads"><Plurals value={missingLoads.length}><Plurals.One>There is still a missing arrow.</Plurals.One><Plurals.NotOne>There are still missing arrows.</Plurals.NotOne></Plurals><Check value={!!pointName}><Check.True> Have another look at point {{ pointName }}.</Check.True></Check></Translation>
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
			return load.span.hasPoint(point)
		case loadTypes.moment:
			return load.position.equals(point)
		default:
			throw new Error(`Invalid load type: did not recognize a load of type "${load.type}".`)
	}
}
