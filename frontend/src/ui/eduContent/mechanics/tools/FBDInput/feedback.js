import { isValidElement } from 'react'

import { isPlainObject, applyMapping } from 'step-wise/util'
import { loadTypes, areLoadsMatching, getLoadMatching } from 'step-wise/eduContent/mechanics'

import { Translation, Check, Plurals, CountingWord } from 'i18n'
import { selectRandomCorrect, selectRandomIncorrect } from 'ui/form'
import { getFeedbackCheckResult, processParameterOptions } from 'ui/eduTools'

import { translationPath } from './validation'

// getFBDFeedbackFunction returns a feedback function to give feedback on Free Body Diagram inputs. It requires comparison options and a set of points to refer to when naming a point.
export function getFBDFeedbackFunction(comparison, points = {}) {
	return (input, solution) => getFBDFeedback(input, solution, comparison, points)
}

// getFBDFeedback takes an input FBD and a solution FBD and compares them to extract feedback. It requires the comparison options too, as well as an object { A: new Vector(...), ... } whose names the feedback may refer to.
export function getFBDFeedback(exerciseData, parameterOptions) {
	// Process the parameters.
	parameterOptions = processParameterOptions(parameterOptions)

	// Walk through the parameters and incorporate feedback.
	const { input, solution, metaData } = exerciseData
	const { comparison } = metaData
	return applyMapping(parameterOptions, (currOptions, currParameter) => {
		const currInput = input[currParameter]
		const currSolution = solution[currParameter]

		// Process the given options for the field. If it's an array, assume they are feedbackChecks. Also merge in the metaData comparison options and previous input/feedback.
		if (typeof currOptions === 'function') // On a function, assume it's a single feedbackCheck.
			currOptions = [currOptions]
		if (Array.isArray(currOptions)) // On an array, assume they are feedbackChecks.
			currOptions = { feedbackChecks: currOptions }
		currOptions.comparison = currOptions.comparison || (comparison && comparison[currParameter]) || comparison?.default

		// Get the feedback individually.
		return getIndividualFBDFeedback(exerciseData, currParameter, currInput, currSolution, currOptions)
	})
}

export function getIndividualFBDFeedback(exerciseData, currParameter, currInput, currSolution, currOptions) {
	const { solution } = exerciseData
	const { points } = solution
	const { comparison, feedbackChecks, feedbackFunction } = currOptions

	// Determine if the field is correct. Do this in the same way as the comparison function from the shared directory.
	const correct = areLoadsMatching(currInput, currSolution, comparison)

	// Walk through the feedback checks and see if one fires.
	const checkResult = getFeedbackCheckResult(exerciseData, feedbackChecks, currInput, currSolution, correct)
	if (checkResult)
		return isPlainObject(checkResult) && !isValidElement(checkResult) ? { correct, ...checkResult } : { correct, text: checkResult }

	// If a feedback function has been provided, then apply it.
	if (feedbackFunction) {
		const feedback = feedbackFunction(currInput, currSolution, currOptions, exerciseData)
		return isPlainObject(feedback) ? { correct, ...feedback } : { correct, text: feedback }
	}

	// Go for default feedback. If the comparison is a function, all we can say is whether it's correct or incorrect.
	if (typeof comparison === 'function')
		return { correct, text: (correct ? selectRandomCorrect : selectRandomIncorrect)() }

	// There are comparison options, so try to find detailed feedback. First set up a matching of loads, so we can give feedback on it.
	const matching = getLoadMatching(currInput, currSolution, comparison)

	// Check if any input loads are not matched.
	const unmatchedInputLoads = currInput.filter((_, index) => matching.input[index].length === 0)
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
	const missingLoads = currSolution.filter((_, index) => matching.solution[index].length === 0)
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
