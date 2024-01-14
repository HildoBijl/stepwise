import { isValidElement } from 'react'

import { arrayFind, isBasicObject, processOptions, deepEquals, applyMapping } from 'step-wise/util'
import { checkNumberEquality, areNumbersEqual, Float, Unit, FloatUnit, Expression } from 'step-wise/inputTypes'
import { performIndividualComparison } from 'step-wise/eduTools'

import { Translation } from 'i18n'
import { selectRandomCorrect, selectRandomIncorrect, selectRandomIncorrectUnit, selectRandomNonNumeric } from 'ui/inputs'

import { processParameterOptions } from './util'

const defaultOptions = {
	comparison: undefined, // A comparison function or object that will be used to check for correctness. If not given, it will be looked for in the exercise metaData.
	feedbackChecks: [], // Checks to be run on the given input. Feedback checks are of the form (currInput, currSolution, solution, correct, exerciseData) => <>SomeMessage</>. Here "currSolution" refers to the solution for this parameter, while "solution" is the full solution object returned from the getSolution function. The value of correct is true/false, indicating whether it was graded to be equal. The first check that returns something truthy will be used.
	feedbackFunction: undefined, // The function to be called after the feedbackChecks have failed to give any result. This is a function of the type (currInput, currSolution, currOptions, exerciseData) => { correct: false, <>SomeMessage</> } or similar. When not given, default feedback is determined based on the input and solution types.
	dependency: undefined, // The names of parameters which the feedback of this parameter may depend on. The feedback of a parameter is only updated when it changes, or any of its dependencies changes.
}

const accuracyFactorForNearHits = 4
const accuracyFactorForMarginWarnings = 1 / 3

// getAllFieldInputsFeedback is a getFeedback function that tries to give feedback about the provided input in as intelligent a manner as possible. It figures out for itself which fields to give input on.
export function getAllFieldInputsFeedback(exerciseData) {
	return getAllFieldInputsFeedbackExcluding([])(exerciseData)
}

// getAllFieldInputsFeedbackExcluding is a function that takes a list of fields not to give feedback on and returns a getFeedback function giving feedback on all other input fields. This is useful if certain input fields do not require feedback, for instance because it's a multiple choice field determining the solution approach.
export function getAllFieldInputsFeedbackExcluding(excludedFields) {
	// Ensure the excluded fields are an array.
	if (!Array.isArray(excludedFields))
		excludedFields = [excludedFields]

	// Set up and return the feedback function.
	return (exerciseData) => {
		// Determine all fields that require feedback and ask for their feedback.
		const inputFields = Object.keys(exerciseData.input).filter(inputField => !excludedFields.includes(inputField))
		return getFieldInputFeedback(exerciseData, inputFields)
	}
}

// getFieldInputFeedback takes an exercise data object and an array of parameters ['p1', 'p2'] and tries to get feedback for these parameters in a default way. It is also possible to pass the parameters as an object of the form { p1: { feedbackChecks: [...], comparison: {...}, p2: { ... } } } to pass extra options per parameter. In the special case that only an array is passed { p1: [...], p2: ... } then this array is assumed to be the feedbackChecks.
export function getFieldInputFeedback(exerciseData, parameterOptions) {
	// Process the parameters.
	parameterOptions = processParameterOptions(parameterOptions)

	// Check out which comparison has been provided.
	const { input, solution, metaData, previousInput, previousFeedback } = exerciseData
	let { comparison } = metaData
	if (typeof comparison === 'function')
		comparison = { default: comparison }
	if (!isBasicObject(comparison))
		throw new Error(`Invalid comparison parameter: expected a basic object with comparison options/functions for each parameter. Received something of type ${typeof comparison}.`)

	// Walk through the parameters and incorporate feedback.
	return applyMapping(parameterOptions, (currOptions, currParameter) => {
		// Extract input and solution. Ignore parameters with no input.
		const currInput = input[currParameter]
		const currSolution = solution[currParameter]
		if (currInput === undefined)
			return

		// Process the given options for the field. If it's an array, assume they are feedbackChecks. Also merge in the metaData comparison options and previous input/feedback.
		if (typeof currOptions === 'function') // On a function, assume it's a single feedbackCheck.
			currOptions = [currOptions]
		if (Array.isArray(currOptions)) // On an array, assume they are feedbackChecks.
			currOptions = { feedbackChecks: currOptions }
		currOptions.comparison = currOptions.comparison || (comparison && comparison[currParameter]) || comparison?.default

		// If the input hasn't changed (and nor have any potential dependencies) then keep the previous feedback.
		let dependency = currOptions.dependency || []
		dependency = [currParameter, ...(Array.isArray(dependency) ? dependency : [dependency])]
		if (previousInput && previousFeedback && previousFeedback[currParameter] && dependency.every(dependencyParameter => {
			const curr = input[dependencyParameter]
			const prev = previousInput[dependencyParameter]
			return prev !== undefined && (curr === prev || (curr.SO !== undefined && deepEquals(curr, prev))) // Is this parameter's input equal to the previous input?
		}))
			return previousFeedback[currParameter]

		// Determine the feedback and save it.
		return getIndividualFieldInputFeedback(exerciseData, currParameter, currInput, currSolution, currOptions)
	})
}

// getIndividualFieldInputFeedback extracts feedback for a single input parameter. It checks which type it is and calls the appropriate function.
function getIndividualFieldInputFeedback(exerciseData, currParameter, currInput, currSolution, currOptions) {
	const { comparison, feedbackChecks, feedbackFunction } = processOptions(currOptions, defaultOptions)
	const { solution } = exerciseData

	// Determine if the field is correct. Do this in the same way as the comparison function from the shared directory.
	const correct = performIndividualComparison(currInput, currSolution, comparison, solution)

	// Walk through the feedback checks and see if one fires.
	const checkResult = getFeedbackCheckResult(exerciseData, feedbackChecks, currInput, currSolution, correct)
	if (checkResult)
		return isBasicObject(checkResult) && !isValidElement(checkResult) ? { correct, ...checkResult } : { correct, text: checkResult }

	// If a feedback function has been provided, then apply it.
	if (feedbackFunction) {
		const feedback = feedbackFunction(currInput, currSolution, currOptions, exerciseData)
		return isBasicObject(feedback) ? { correct, ...feedback } : { correct, text: feedback }
	}

	// Go for default feedback. If the comparison is a function, all we can say is whether it's correct or incorrect.
	if (typeof comparison === 'function')
		return { correct, text: (correct ? selectRandomCorrect : selectRandomIncorrect)() }

	// There are comparison options, so try to find detailed feedback. If the parameters are pure numbers (or numeric Expressions) compare them using number comparison.
	if (currSolution instanceof Expression && currSolution.isNumeric())
		currSolution = currSolution.number
	if (typeof currSolution === 'number') {
		if (currInput instanceof Expression) {
			if (!currInput.isNumeric())
				return { correct, text: selectRandomNonNumeric() }
			currInput = currInput.number
		}
		return { correct, text: getNumberComparisonFeedback(currInput, currSolution, currOptions, false) }
	}

	// It's not a pure number. Try various other parameter types.
	if (currInput.constructor === Unit)
		return { correct, text: getUnitComparisonFeedback(currInput, currSolution, currOptions.comparison) }
	if (currInput.constructor === Float)
		return { correct, text: getNumberComparisonFeedback(currInput, currSolution, currOptions, true, value => value.number) }
	if (currInput.constructor === FloatUnit)
		return { correct, text: getNumberComparisonFeedback(currInput, currSolution, currOptions, true, value => value.float.number) }

	// No clue what kind of type we have.
	throw new Error(`Default feedback error: could not set up specific feedback for parameter "${currParameter}". Its type does not support automatic feedback. You can use a comparison function for comparison, and then feedback checks for specific feedback.`)
}

/* getFeedbackCheckResult gets an array of feedback checks and various other data. It then runs through these feedback checks to see if one matches and returns the corresponding feedback.
 * The feedback checks must be an array of the form [(currInput, currSolution, solution, correct, exerciseData) => <>This is the feedback if the check matches.</>, ...]. Note that the solution is the full solution object given by the getSolution function. Correct is just a boolean: is this field correct or not.
 * The first feedback checks that returns something truthy will be used. The value given will be return. If no feedback check returns anything truthy, nothing (undefined) will be returned.
 */
export function getFeedbackCheckResult(exerciseData, feedbackChecks, currInput, currSolution, correct) {
	// Check the input.
	if (feedbackChecks === undefined)
		return undefined
	if (typeof feedbackChecks === 'function')
		feedbackChecks = [feedbackChecks]
	if (!Array.isArray(feedbackChecks))
		throw new Error(`Invalid feedbackChecks parameter: the feedbackChecks parameter must be an array. Instead, something of type "${typeof feedbackChecks}" was given.`)

	// Find the first feedback check to return something truthy and return the resulting value.
	const { solution } = exerciseData
	const result = arrayFind(feedbackChecks, (check) => check(currInput, currSolution, solution, correct, exerciseData))
	return result && result.value
}

// getNumberComparisonFeedback takes two numbers: an input answer and a solution answer. It then compares these and returns a feedback object in the form { correct: true/false, text: 'Some feedback text' }.
export function getNumberComparisonFeedback(currInput, currSolution, currOptions, objectBased, getNumber = (x => x)) {
	const { comparison, previousFeedback } = processOptions(currOptions, defaultOptions)

	// How to get equality data and equality depends on whether this is object-based (like with a Float) or number-based (like with regular numbers).
	const equalityData = objectBased ?
		currSolution.checkEquality(currInput, comparison) :
		checkNumberEquality(currInput, currSolution, comparison)
	const correct = equalityData.result
	const isEqual = (currInput, currSolution, accuracyFactorAdjustment) => objectBased ?
		currSolution.equals(currInput, { ...comparison, accuracyFactor: (comparison.accuracyFactor || 1) * accuracyFactorAdjustment }) :
		areNumbersEqual(currInput, currSolution, { ...comparison, accuracyFactor: (comparison.accuracyFactor || 1) * accuracyFactorAdjustment })

	// On a correct answer, check if a margin warning is needed. Otherwise give the default message.
	if (correct) {
		if (!isEqual(currInput, currSolution, accuracyFactorForMarginWarnings))
			return <Translation path="eduTools/feedback" entry="numeric.withinMargin">You're still within the margin, but this could be more accurate.</Translation>
		return (previousFeedback && previousFeedback.correct && previousFeedback.text) || selectRandomCorrect()
	}

	// Check the unit (when needed).
	if (equalityData.unitOK !== undefined && !equalityData.unitOK) {
		return getUnitComparisonFeedback(currInput.unit, currSolution.unit, { type: comparison?.unitCheck, checkSize: comparison?.checkUnitSize })
	}

	// Something is incorrect. Check the signs.
	const inputSign = Math.sign(getNumber(currInput))
	const solutionSign = Math.sign(getNumber(currSolution))
	if (inputSign * solutionSign === -1)
		return <Translation path="eduTools/feedback" entry="numeric.wrongSign">You haven't used the right sign. Check your pluses and minuses.</Translation>

	// Check for a near-hit.
	if (isEqual(currInput, currSolution, accuracyFactorForNearHits))
		return <Translation path="eduTools/feedback" entry="numeric.nearby">You're very close! Check for accuracy and rounding errors.</Translation>

	// Check if we're too high or too low. On negative numbers flip the phrasing.
	if (equalityData.magnitude !== undefined && equalityData.magnitude !== 'OK') {
		if (inputSign === 0) {
			if (solutionSign === -1)
				return <Translation path="eduTools/feedback" entry="numeric.notZeroNegative">Zero is sadly wrong. We do expect a (possibly negative) number here.</Translation>
			else
				return <Translation path="eduTools/feedback" entry="numeric.notZeroPositive">Zero is sadly wrong. We do expect a number here.</Translation>
		} else if (inputSign === -1) {
			if (equalityData.magnitude === 'TooLarge')
				return <Translation path="eduTools/feedback" entry="numeric.negativeTooLarge">Your answer is (magnitude-based) too small. We expected something even more negative.</Translation>
			else
				return <Translation path="eduTools/feedback" entry="numeric.negativeTooSmall">Your answer is (magnitude-based) too large. We expected something closer to zero.</Translation>
		} else {
			if (equalityData.magnitude === 'TooLarge')
				return <Translation path="eduTools/feedback" entry="numeric.positiveTooLarge">Your answer is too large.</Translation>
			else
				return <Translation path="eduTools/feedback" entry="numeric.positiveTooSmall">Your answer is too small.</Translation>
		}
	}

	// Check the number of significant digits.
	if (equalityData.numSignificantDigits !== undefined && equalityData.numSignificantDigits !== 'OK') {
		if (equalityData.numSignificantDigits === 'TooLarge')
			return <Translation path="eduTools/feedback" entry="numeric.tooManySignificantDigits">You used too many significant digits.</Translation>
		else
			return <Translation path="eduTools/feedback" entry="numeric.tooFewSignificantDigits">You used too few significant digits.</Translation>
	}

	// Check the power. (In case it was examined.)
	if (equalityData.power !== undefined && equalityData.power !== 'OK') {
		if (equalityData.power === 'TooLarge')
			return <Translation path="eduTools/feedback" entry="numeric.tooLargePower">The exponent you used is too large.</Translation>
		else
			return <Translation path="eduTools/feedback" entry="numeric.tooSmallPower">The exponent you used is too small.</Translation>
	}

	// Something else is wrong, but not sure what.
	return selectRandomIncorrect()
}

// getUnitComparisonFeedback takes an input unit and a solution unit, and gives feedback on it. This can be both for a unit as part of a FloatUnit, but also as a unit on its own.
export function getUnitComparisonFeedback(currInput, currSolution, currComparison) {
	if (currSolution.equals(currInput, currComparison))
		return selectRandomCorrect()
	return selectRandomIncorrectUnit()
}
