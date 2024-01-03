import { isValidElement } from 'react'

import { arrayFind, isBasicObject, keysToObject, processOptions, deepEquals } from 'step-wise/util'
import { checkNumberEquality, areNumbersEqual, Float, Unit, FloatUnit, Expression } from 'step-wise/inputTypes'
import { performIndividualComparison, performIndividualListComparison, getCurrentInputSolutionAndComparison } from 'step-wise/eduTools'

import { Translation } from 'i18n'
import { selectRandomCorrect, selectRandomIncorrect, selectRandomIncorrectUnit, selectRandomDuplicate, selectRandomNonNumeric } from 'ui/inputs'

const defaultOptions = {
	// These are options that can be manually added.
	feedbackChecks: [], // Checks to be run on the given input. Feedback checks are of the form (currInput, currSolution, solution, correct, exerciseData) => <>SomeMessage</>. Here "currSolution" refers to the solution for this parameter, while "solution" is the full solution object returned from the getSolution function. The value of correct is true/false, indicating whether it was graded to be equal. The first check that returns something truthy will be used.
	feedbackFunction: undefined, // The function to be called after the feedbackChecks have failed to give any result. This is a function of the type (currInput, currSolution, currOptions, exerciseData) => { correct: false, <>SomeMessage</> } or similar. When not given, default feedback is determined based on the input and solution types.

	// These are options automatically added, based on exerciseData.
	comparison: {}, // A comparison function or object that will be used to check for correctness.
	previousInput: undefined,
	previousFeedback: undefined,
}

const accuracyFactorForNearHits = 4
const accuracyFactorForMarginWarnings = 1 / 3

// ToDo: adjust/rename.
// getAllInputFieldsFeedback is a getFeedback function that tries to give feedback about the provided input in as intelligent a manner as possible. It figures out for itself which fields to give input on.
export function getAllInputFieldsFeedback(exerciseData) {
	return getAllInputFieldsFeedbackExcluding([])(exerciseData)
}

// ToDo: adjust/rename.
// getAllInputFieldsFeedbackExcluding is a function that takes a list of fields not to give feedback on and returns a getFeedback function giving feedback on all other input fields. This is useful if certain input fields do not require feedback, for instance because it's a multiple choice field determining the solution approach.
export function getAllInputFieldsFeedbackExcluding(excludedFields) {
	// Ensure the excluded fields are an array.
	if (!Array.isArray(excludedFields))
		excludedFields = [excludedFields]

	// Set up and return the feedback function.
	return (exerciseData) => {
		// Determine all fields that require feedback and ask for their feedback.
		const inputFields = Object.keys(exerciseData.input).filter(inputField => !excludedFields.includes(inputField))
		return getInputFieldFeedback(inputFields.length === 1 ? inputFields[0] : inputFields, exerciseData)
	}
}

// getFieldInputFeedback takes an exercise data object and an array of parameters ['p1', 'p2'] and tries to get feedback for these parameters in a default way. It is also possible to pass the parameters as an object of the form { p1: { feedbackChecks: [...], comparison: {...}, p2: { ... } } } to pass extra options per parameter. In the special case that only an array is passed { p1: [...], p2: ... } then this array is assumed to be the feedbackChecks.
export function getFieldInputFeedback(exerciseData, parameterOptions) {
	// Process the parameters.
	if (typeof parameterOptions === 'string')
		parameterOptions = [parameterOptions]
	if (Array.isArray(parameterOptions))
		parameterOptions = keysToObject(parameterOptions, () => ({}))
	if (!isBasicObject(parameterOptions))
		throw new Error(`Invalid getFieldInputFeedback parameters: expected either a string, an array of strings or an object with options, but received something of type ${typeof parameterOptions}.`)

	// Walk through the parameters and incorporate feedback.
	const { input, solution, metaData, previousInput, previousFeedback } = exerciseData
	const { comparison } = metaData
	const feedback = {}
	Object.keys(parameterOptions).forEach(currParameter => {
		// Extract input and solution. Ignore parameters with no input.
		const currInput = input[currParameter]
		const currSolution = solution[currParameter]
		if (currInput === undefined)
			return

		// Process the given options for the field. If it's an array, assume they are feedbackChecks. Also merge in the metaData comparison options and previous input/feedback.
		let currOptions = parameterOptions[currParameter]
		if (typeof currOptions === 'function') // On a function, assume it's a single feedbackCheck.
			currOptions = [currOptions]
		if (Array.isArray(currOptions)) // On an array, assume they are feedbackChecks.
			currOptions = { feedbackChecks: currOptions }
		currOptions.comparison = currOptions.comparison || (comparison && comparison[currParameter]) || comparison?.default
		currOptions.previousInput = previousInput[currParameter]
		currOptions.previousFeedback = previousFeedback[currParameter]

		// Determine the feedback and save it.
		feedback[currParameter] = getIndividualFieldInputFeedback(exerciseData, currParameter, currInput, currSolution, currOptions)
	})

	// All done! Return feedback.
	return feedback
}

// ToDo: remove this function once the rest is pulled over to the new format.
/* getInputFieldFeedback takes an array of parameter names (like ['p1', 'p2', 'V1', 'V2']) and provides feedback on these parameters. It is also possible to give a single parameter 'p1'. The function has three input arguments.
 * - parameters: an array of IDs.
 * - exerciseData: the full exerciseData object. This contains:
 *   x state: the state of the exercise.
 *   x input: what the user provided.
 *   x progress: the progress made so far.
 *   x shared: the data from the shared file of the exercise.
 *   x solution: if the shared file has a getSolution function, this is called on the state and the corresponding solution is added.
 *   x more ... run a console log to see what else is available.
 * - extraOptions: an array of extra options per parameter. This is on top of what the feedback function already adds by default. See the defaultOptions object above.
 * If the parameters array is a single string, the options may also be a single object. That is, this function also works for single parameters.
 * 
 * The outcome of this function is a feedback object for each respective parameter. So { x1: { correct: false, text: 'Nope!' }, x2: { ... } }.
 */
export function getInputFieldFeedback(parameters, exerciseData, extraOptions) {
	// Check if we have one or multiple parameters.
	let singleParameterCase = false
	if (!Array.isArray(parameters)) {
		singleParameterCase = true
		parameters = [parameters]
		extraOptions = [extraOptions]
	}

	// Extract parameters and check that they are suitable.
	const { input, previousInput, previousFeedback, solution, comparison } = extractComparisonFromExerciseData(exerciseData)

	// Walk through the parameters and incorporate feedback.
	const feedback = {}
	parameters.forEach((currParameter, index) => {
		// Ignore null parameters and undefined input values.
		if (currParameter === null)
			return
		if (input[currParameter] === undefined)
			return

		// Get the input, solution and comparison method.
		const { currInput, currSolution, currComparison } = getCurrentInputSolutionAndComparison(currParameter, input, solution, comparison, singleParameterCase)
		const currExtraOptions = (Array.isArray(extraOptions) ? extraOptions[index] : extraOptions) || {}

		// On no input, do not give feedback.
		if (currInput === undefined)
			return // No input has been given yet.

		// If we have exactly the same input before, and there already was feedback earlier, use that.
		const previousInputAnswer = previousInput[currParameter]
		if (previousInputAnswer !== undefined && (currInput === previousInputAnswer || (currInput.SO !== undefined && deepEquals(currInput.SO, previousInputAnswer.SO))) && previousFeedback[currParameter] !== undefined) {
			feedback[currParameter] = previousFeedback[currParameter]
			return
		}

		// Assemble the options for the comparison.
		const currOptions = { comparison: currComparison, previousInput: previousInput[currParameter], previousFeedback: previousFeedback[currParameter], solution, ...currExtraOptions }

		// Extract the feedback and save it.
		feedback[currParameter] = getIndividualFieldInputFeedback(currParameter, currInput, currSolution, currOptions, exerciseData)
	})

	// All done! Return feedback.
	return feedback
}

// getIndividualFieldInputFeedback extracts feedback for a single input parameter. It checks which type it is and calls the appropriate function.
function getIndividualFieldInputFeedback(exerciseData, currParameter, currInput, currSolution, currOptions) {
	const { comparison, previousInput, previousFeedback, feedbackChecks, feedbackFunction } = processOptions(currOptions, defaultOptions)
	const { solution } = exerciseData

	// If the previous input equals the current input, keep the previous feedback.
	if (previousInput !== undefined && (currInput === previousInput || (currInput.SO !== undefined && deepEquals(currInput.SO, previousInput.SO))) && previousFeedback !== undefined)
		return previousFeedback

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
function getFeedbackCheckResult(exerciseData, feedbackChecks, currInput, currSolution, correct) {
	// Check the input.
	if (feedbackChecks === undefined)
		return undefined
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

/* getInputFieldListFeedback gets an array of parameters and attempts to give feedback for the respective input fields. The main difference is that the fields may not have to be in the same order as the fields in the solution field.
The extra options given can be an array with options for each parameter, or it can be single object that holds for every parameter. It may contain specific text to give on a "correct", a "wrongValue" case or a "usedValue" case. */
export function getInputFieldListFeedback(parameters, exerciseData, extraOptions = []) {
	// Extract parameters and check that they are suitable.	
	const { input, solution, comparison } = extractComparisonFromExerciseData(exerciseData)

	// Define the way in which the answers are compared.
	const doValuesMatch = (inputParameter, solutionParameter) => performIndividualListComparison(inputParameter, solutionParameter, input, solution, comparison)

	// Walk through the parameters and try to find each one a matching partner. Incorporate feedback based on what is found.
	const feedback = {}
	const matched = parameters.map(() => false)
	parameters.forEach((inputParameter, inputIndex) => {
		const currExtraOptions = Array.isArray(extraOptions) ? (extraOptions[inputIndex] || {}) : extraOptions

		// Is there an unmatched corresponding partner?
		const solutionIndex = parameters.findIndex((solutionParameter, index) => (!matched[index] && doValuesMatch(inputParameter, solutionParameter)))
		if (solutionIndex !== -1) {
			// There is a corresponding partner. Register match and give correct feedback.
			matched[solutionIndex] = true
			feedback[inputParameter] = { correct: true, text: currExtraOptions.correct || selectRandomCorrect() }
		} else {
			// If there is no unmatched corresponding partner, check if there potentially is an earlier matched corresponding partner. If so, note the duplicate. Otherwise it's just plain wrong.
			if (parameters.find((solutionParameter, solutionIndex) => (matched[solutionIndex] && doValuesMatch(inputParameter, solutionParameter))))
				feedback[inputParameter] = { correct: false, text: currExtraOptions.usedValue || selectRandomDuplicate() }
			else
				feedback[inputParameter] = { correct: false, text: currExtraOptions.wrongValue || selectRandomIncorrect() }
		}
	})
	return feedback
}

/* getMCFeedback provides a default feedback for multiple choice input fields. Currently this only works for single-input multiple choice and not multi-input. Parameters are:
 * - parameter: the parameter name (ID) of the field.
 * - exerciseData: all the data for the exercise in the standard format.
 * - options: an object with options.
 * The options object can contain the following.
 * - correct: the correct answer. It is used to determine if the given input is correct or not. If it is not given, it is attempted to be pulled out of the getSolution function.
 * - done: whether the question is done. If so, the correct answer will be displayed.
 * - step: if provided, the progress object is used to determine whether this question is done. Only used if "done" is not given.
 * - substep: if provided, the corresponding substep is checked.
 * - text: the text corresponding to each option, if it is selected. This is usually an array of strings/JSXs. If it is not an array, the given text is simply always shown.
 * - correctText: the text that is used upon a correct answer, if no text is given.
 * - incorrectText: the text that is used upon an incorrect answer, if no text is given.
 * The object returned is of the form { [name]: { subfields: { 0: { correct: false, text: 'Wrong!' }, 1: { correct: true } } } }
 */
export function getMCFeedback(parameter, exerciseData, options = {}) {
	const { input, progress, solution } = exerciseData
	let { correct, done, step, substep, text, correctText, incorrectText } = options

	// Attempt to get correct answer if not given.
	if (correct === undefined)
		correct = solution[parameter]

	// Attempt to determine "done".
	if (done === undefined) {
		if (progress.done) {
			done = progress.done
		} else if (step !== undefined) {
			let currProgress = progress[step]
			if (substep !== undefined)
				currProgress = currProgress && currProgress[substep]
			done = currProgress && currProgress.done
		}
	}

	// If the exercise is done, show the correct answer.
	const feedback = {}
	if (done && correct !== undefined)
		feedback[correct] = true

	// If there is an input, show the feedback on this input.
	const currInput = input[parameter]
	if (currInput !== undefined) {
		const isCorrect = correct === currInput
		let feedbackText = Array.isArray(text) ? text[currInput] : text
		if (!feedbackText)
			feedbackText = (isCorrect ? correctText : incorrectText)
		feedback[currInput] = {
			correct: isCorrect,
			text: feedbackText,
		}
	}

	// Return result in appropriate format.
	return { [parameter]: { subfields: feedback } }
}

// extractComparisonFromExerciseData extracts shared data and the comparison method from the exercise data, assuring it's present. It also returns all other properties from the exerciseData, to allow easy variable definitions.
function extractComparisonFromExerciseData(exerciseData) {
	// Ensure there is a solution.
	const { shared, solution } = exerciseData
	if (!solution)
		throw new Error(`Default feedback error: could not find a "getSolution" function exported from the shared file.`)

	// Get the data out of the shared file.
	const { data } = shared
	if (!data)
		throw new Error(`Default feedback error: could not find a "data" parameter in the shared file.`)

	// Get the comparison method out of the data.
	const { comparison } = data
	if (!comparison)
		throw new Error(`Default feedback error: could not find a "comparison" parameter in the shared data that can be used to compare fields with.`)

	// All checks are done. Return the result.
	return { ...exerciseData, data, comparison }
}
