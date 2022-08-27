import { arrayFind } from 'step-wise/util/arrays'
import { processOptions, deepEquals, getPropertyOrDefault } from 'step-wise/util/objects'
import { checkNumberEquality, areNumbersEqual } from 'step-wise/inputTypes/Integer'
import { Float } from 'step-wise/inputTypes/Float'
import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'
import { Expression } from 'step-wise/CAS'
import { performIndividualComparison, performIndividualListComparison } from 'step-wise/edu/exercises/util/comparison'

import { selectRandomCorrect, selectRandomIncorrect, selectRandomIncorrectUnit, selectRandomDuplicate, selectRandomNonNumeric } from 'util/feedbackMessages'

const defaultOptions = {
	// These are options that can be manually added.
	text: {}, // The text to use in various cases.
	feedbackChecks: [], // Extra checks that can be performed to give specific feedback to the user based on the provided input, performed before the regular feedback checks. All feedback checks are of the form (currInput, currSolution, solution, isCorrect, exerciseData) => <>SomeMessage</>. Here "currSolution" refers to the solution for this parameter, while "solution" is the full solution object returned from the getSolution function. isCorrect is true/false, indicating whether it was graded to be equal. The first check that returns something truthy will be used.

	// These are options automatically added, based on exerciseData.
	comparison: undefined, // A comparison function or object that will be used to check for correctness.
	previousInput: undefined,
	previousFeedback: undefined,
	solution: {}, // This will contain the full "solution" object returned from the getSolution function. 
}

const accuracyFactorForNearHits = 4
const accuracyFactorForMarginWarnings = 1 / 3

// getAllInputFieldsFeedback is a getFeedback function that tries to give feedback about the provided input in as intelligent a manner as possible. It figures out for itself which fields to give input on.
export function getAllInputFieldsFeedback(exerciseData) {
	return getAllInputFieldsFeedbackExcluding([])(exerciseData)
}

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

/* getInputFieldFeedback takes an array of parameter names (like ['p1', 'p2', 'V1', 'V2']) and provides feedback on these parameters. It is also possible to give a single parameter 'p1'. The function has three input arguments.
 * - parameters: an array of IDs.
 * - exerciseData: the full exerciseData object. This contains:
 *   x state: the state of the exercise.
 *   x input: what the user provided.
 *   x progress: the progress made so far.
 *   x shared: the data from the shared file of the exercise.
 *   x solution: if the shared file has a getSolution function, this is called on the state and the corresponding solution is added.
 *   x more ... run a console.log to see what else is available.
 * - extraOptions: an array of extra options per parameter. This is on top of what the feedback function already adds by default. See the defaultOptions object above.
 * If the parameters array is a single string, the options may also be a single object. That is, this function also works for single parameters.
 * 
 * The outcome of this function is a feedback object for each respective parameter. So { x1: { correct: false, text: 'Nope!' }, x2: { ... } }.
 */
export function getInputFieldFeedback(parameters, exerciseData, extraOptions) {
	// Check if we have one or multiple parameters.
	let singleParameter = false
	if (!Array.isArray(parameters)) {
		singleParameter = true
		parameters = [parameters]
		extraOptions = [extraOptions]
	}

	// Extract parameters and check that they are suitable.
	const { input, previousInput, previousFeedback, solution, comparison } = extractComparisonFromExerciseData(exerciseData)

	// Walk through the parameters and incorporate feedback.
	const feedback = {}
	parameters.forEach((currParameter, index) => {
		// Ignore null parameters.
		if (currParameter === null)
			return

		// Get the input.
		const currInput = input[currParameter]
		if (currInput === undefined)
			return // No input has been given yet.

		// If we have exactly the same input before, return the same feedback.
		const previousInputAnswer = previousInput[currParameter]
		if (previousInputAnswer !== undefined && (currInput === previousInputAnswer || (currInput.SO !== undefined && deepEquals(currInput.SO, previousInputAnswer.SO)))) {
			feedback[currParameter] = previousFeedback[currParameter]
			return
		}

		// Get the correct answer and other data to check the answer.
		const currSolution = getPropertyOrDefault(solution, currParameter, false, singleParameter, true)
		const currComparison = getPropertyOrDefault(comparison, currParameter, true, singleParameter, false)
		const currExtraOptions = (extraOptions && extraOptions[index]) || {}

		// Assemble the options for the comparison.
		const currOptions = { comparison: currComparison, previousInput: previousInput[currParameter], previousFeedback: previousFeedback[currParameter], solution, ...currExtraOptions }

		// Extract the feedback and save it.
		feedback[currParameter] = getIndividualInputFieldFeedback(currParameter, currInput, currSolution, currOptions, exerciseData)
	})

	// All done! Return feedback.
	return feedback
}

// getIndividualInputFieldFeedback extracts feedback for a single input parameter. It checks which type it is and calls the appropriate function.
function getIndividualInputFieldFeedback(currParameter, currInput, currSolution, currOptions, exerciseData) {
	// Determine if the field is correct. Do this in the same way as the comparison function from the shared directory.
	const { comparison, solution, previousInput, previousFeedback, feedbackChecks, text } = processOptions(currOptions, defaultOptions)
	const correct = performIndividualComparison(currParameter, currInput, currSolution, comparison, solution)

	// Walk through the feedback checks and see if one fires.
	const checkResult = getFeedbackCheckResult(feedbackChecks, currInput, currSolution, solution, correct, exerciseData)
	if (checkResult)
		return { correct, text: checkResult }

	// Check if the input is the same as before. If so, keep the feedback.
	if (deepEquals(currInput, previousInput))
		return previousFeedback

	// If the comparison method is a function, there are no checks we can do. Go for a default approach.
	if (typeof comparison === 'function') {
		if (correct)
			return { correct, text: text.correct || selectRandomCorrect() }
		return { correct, text: text.incorrect || selectRandomIncorrect() }
	}

	// We can do a detailed approach! The exact method depends on the data type.

	// If the parameters are pure numbers (or numeric Expressions) compare them using number comparison.
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
	if (currInput.constructor === Float)
		return { correct, text: getNumberComparisonFeedback(currInput, currSolution, currOptions, true, value => value.number) }
	if (currInput.constructor === FloatUnit)
		return { correct, text: getNumberComparisonFeedback(currInput, currSolution, currOptions, true, value => value.float.number) }

	// No clue what kind of type we have.
	throw new Error(`Default feedback error: could not set up specific feedback for parameter "${currParameter}". Its type does not support automatic feedback. You can use a comparison function for comparison, and then feedback checks for specific feedback.`)
}

/*    takes two numbers: an input answer and a solution answer. It then compares these and returns a feedback object in the form { correct: true/false, text: 'Some feedback text' }. Various options can be provided within the third parameter:
 * - comparison: an object with options detailing how the comparison must be performed.
 * - text: an object with text for certain cases. It's the message if ...
 *   x correct: if it's correct.
 *   x marginWarning: if it's within margin (so correct) but is close to being wrong.
 *   x sign: if it's incorrect due to the sign of the answer.
 *   x near: if it's near the answer.
 *   x unit: if the unit is faulty.
 *   x tooLarge: if it's too high.
 *   x tooSmall: if it's too low.
 *   x wrongValue: a placeholder for both tooHigh and tooLow.
 *   x tooManySignificantDigits: if there are too many significant digits.
 *   x tooFewSignificantDigits: if there are too few significant digits.
 *   x wrongSignificantDigits: a placeholder for both of the above.
 *   x tooLargePower: if the power (10^x) is too high. (Assuming it's checked.)
 *   x tooSmallPower: if the power (10^x) is too low. (Assuming it's checked.)
 *   x wrongPower: a placeholder for both of the above.
 *   x incorrect: if it's wrong for some unknown reason.
 */
export function getNumberComparisonFeedback(currInput, currSolution, options, objectBased, getNumber = (x => x)) {
	const { comparison, text, previousFeedback } = processOptions(options, defaultOptions)

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
			return text.marginWarning || 'Je zit nog binnen de marge, maar het kan nauwkeuriger.'
		return text.correct || (previousFeedback && previousFeedback.correct && previousFeedback.text) || selectRandomCorrect()
	}

	// Check the unit (when needed).
	if (equalityData.unitOK !== undefined && !equalityData.unitOK)
		return text.unit || selectRandomIncorrectUnit()

	// Something is incorrect. Check the signs.
	const inputSign = Math.sign(getNumber(currInput))
	const solutionSign = Math.sign(getNumber(currSolution))
	if (inputSign * solutionSign === -1)
		return text.sign || 'Je antwoord heeft niet het juiste teken. Controleer plussen en minnen.'

	// Check for a near-hit.
	if (isEqual(currInput, currSolution, accuracyFactorForNearHits))
		return text.near || 'Je zit erg in de buurt! Maak je antwoord iets nauwkeuriger.'

	// Check if we're too high or too low. On negative numbers flip the phrasing.
	if (equalityData.magnitude !== undefined && equalityData.magnitude !== 'OK') {
		if (inputSign === 0) {
			if (solutionSign === -1)
				return text.tooLarge || text.wrongValue || 'Je antwoord is (qua absolute waarde) te klein.'
			else
				return text.tooSmall || text.wrongValue || 'Je antwoord is (qua absolute waarde) te klein.'
		} else if (inputSign === -1) {
			if (equalityData.magnitude === 'TooLarge')
				return text.tooLarge || text.wrongValue || 'Je antwoord is (qua absolute waarde) te klein.'
			else
				return text.tooSmall || text.wrongValue || 'Je antwoord is (qua absolute waarde) te groot.'
		} else {
			if (equalityData.magnitude === 'TooLarge')
				return text.tooLarge || text.wrongValue || 'Je antwoord is te groot.'
			else
				return text.tooSmall || text.wrongValue || 'Je antwoord is te klein.'
		}
	}

	// Check the number of significant digits.
	if (equalityData.numSignificantDigits !== undefined && equalityData.numSignificantDigits !== 'OK') {
		if (equalityData.numSignificantDigits === 'TooLarge')
			return text.tooManySignificantDigits || text.wrongSignificantDigits || 'Je hebt te veel significante getallen.'
		else
			return text.tooFewSignificantDigits || text.wrongSignificantDigits || 'Je hebt te weinig significante getallen.'
	}

	// Check the power. (In case it was examined.)
	if (equalityData.power !== undefined && equalityData.power !== 'OK') {
		if (equalityData.power === 'TooLarge')
			return text.tooLargePower || text.wrongPower || 'De gebruikte tien-macht is te groot.'
		else
			return text.tooSmallPower || text.wrongPower || 'De gebruikte tien-macht is te klein.'
	}

	// Something else is wrong, but not sure what.
	return text.incorrect || selectRandomIncorrect()
}

/* getFeedbackCheckResult gets an array of feedback checks and various other data. It then runs through these feedback checks to see if one matches and returns the corresponding feedback.
 * The feedback checks must be an array of the form [(currInput, currSolution, solution, correct, exerciseData) => <>This is the feedback if the check matches.</>, ...]. Note that the solution is the full solution object given by the getSolution function. Correct is just a boolean: is this field correct or not.
 * The first feedback checks that returns something truthy will be used. The value given will be return. If no feedback check returns anything truthy, nothing (undefined) will be returned.
 */
function getFeedbackCheckResult(feedbackChecks, currInput, currSolution, solution, correct, exerciseData) {
	// Check the input.
	if (!feedbackChecks)
		return undefined
	if (!Array.isArray(feedbackChecks))
		throw new Error(`Invalid feedbackChecks parameter: the feedbackChecks parameter must be an array. Instead, something of type "${typeof feedbackChecks}" was given.`)

	// Find the first feedback check to return something truthy and return the resulting value.
	const result = arrayFind(feedbackChecks, (check) => check(currInput, currSolution, solution, correct, exerciseData))
	return result && result.value
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
 * - name: the name of the field.
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
 * The object returned is of the form { [name]: { 0: { correct: false, text: 'Wrong!' }, 1: { correct: true } } }
 */
export function getMCFeedback(name, exerciseData, options = {}) {
	const { input, progress, solution } = exerciseData
	let { correct, done, step, substep, text, correctText, incorrectText } = options

	// Attempt to get correct answer if not given.
	if (correct === undefined)
		correct = solution[name]

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
	const currInput = input[name]
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
	return { [name]: feedback }
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
