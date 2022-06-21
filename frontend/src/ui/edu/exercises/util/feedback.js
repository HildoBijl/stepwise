import { arrayFind } from 'step-wise/util/arrays'
import { selectRandomly, selectRandomCorrect, selectRandomIncorrect } from 'step-wise/util/random'
import { processOptions, deepEquals, getPropertyOrDefault } from 'step-wise/util/objects'
import { checkNumberEquality, areNumbersEqual } from 'step-wise/inputTypes/Integer'
import { Float } from 'step-wise/inputTypes/Float'
import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'
import { Expression, Equation } from 'step-wise/CAS'
import { performComparison } from 'step-wise/edu/exercises/util/comparison'

const defaultComparisonOptions = {
	// These are options automatically added, based on exerciseData.
	equalityOptions: {}, // Options with which to compare equality. Mainly used for comparing numbers/units.
	comparison: undefined, // A comparison function that will be used to check for correctness. Mainly used for comparing expressions/equations.
	prevInput: undefined,
	prevFeedback: undefined,
	solution: {}, // This will contain the full "solution" object returned from the getSolution function. 

	// These are options that can be manually added.
	text: {}, // The text to use in various cases.
	feedbackChecks: [], // Extra checks that can be performed to give specific feedback to the user based on the provided input. All feedback checks are of the form (input, correct, solution, isCorrect, exerciseData) => <>SomeMessage</>. Here "correct" is the correct answer (obtained from the solution) and isCorrect is true/false, indicating whether it was graded to be equal. The first check that returns something truthy will be used.
}

const accuracyFactorForNearHits = 4

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
 *   x input: this is used to extract the given answers from. 
 *   x getSolution: this is used to get the correct answers.
 *   x data: from the shared file. This may contain "equalityOptions" for Float/FloatUnit comparisons, or "check" for Expression/Equation comparison.
 * - options: an array of options per parameter.
 * If the parameters array is a single string, the extraOptions may also be a single object. That is, this function also works for single parameters.
 * 
 * The outcome of this function is a feedback object for each respective parameter. So { p1: { correct: false, text: 'Nope!' }, p2: { ... } }.
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
	const { input, shared, prevInput, prevFeedback, solution } = exerciseData
	const { data } = shared
	if (!data)
		throw new Error(`Default feedback error: could not find a "data" parameter in the shared file.`)
	if (!solution)
		throw new Error(`Default feedback error: could not find a "getSolution" function exported from the shared file.`)

	// Extract the way in which the answers are checked.
	const { equalityOptions, comparison } = data

	// Walk through the parameters and incorporate feedback.
	const feedback = {}
	parameters.forEach((currParameter, index) => {
		// Ignore null parameters.
		if (currParameter === null)
			return

		// Get the input.
		const inputAnswer = input[currParameter]
		if (inputAnswer === undefined)
			return // No input has been given yet.

		// If we had exactly the same input before, return the same feedback.
		const prevInputAnswer = prevInput[currParameter]
		if (prevInputAnswer !== undefined && (inputAnswer === prevInputAnswer || deepEquals(inputAnswer.SO, prevInputAnswer.SO))) {
			feedback[currParameter] = prevFeedback[currParameter]
			return
		}

		// Get the correct answer and other data to check the answer.
		const correctAnswer = getPropertyOrDefault(solution, currParameter, false, singleParameter, true)
		const currEqualityOptions = getPropertyOrDefault(equalityOptions, currParameter, true, singleParameter, false)
		const currComparison = getPropertyOrDefault(comparison, currParameter, true, singleParameter, false)
		const currExtraOptions = (extraOptions && extraOptions[index]) || {}

		// Assemble the options for the comparison.
		const options = { equalityOptions: currEqualityOptions, comparison: currComparison, prevInput: prevInput[currParameter], prevFeedback: prevFeedback[currParameter], solution, ...currExtraOptions }

		// Call the comparison function for the correct parameter type. First check if it's a pure number.
		const isInputANumber = inputAnswer.constructor === (0).constructor
		const isCorrectANumber = correctAnswer.constructor === (0).constructor
		if (isInputANumber || isCorrectANumber) {
			const inputAsNumber = (isInputANumber ? inputAnswer : inputAnswer.number)
			const correctAsNumber = (isCorrectANumber ? correctAnswer : correctAnswer.number)
			feedback[currParameter] = getNumberComparisonFeedback(correctAsNumber, inputAsNumber, options, exerciseData)
			return
		}

		// It's not a pure number. Try various other parameter types.
		if (inputAnswer.constructor === Float) {
			feedback[currParameter] = getFloatComparisonFeedback(inputAnswer, correctAnswer, options, exerciseData)
			return
		}
		if (inputAnswer.constructor === FloatUnit) {
			feedback[currParameter] = getFloatUnitComparisonFeedback(inputAnswer, correctAnswer, options, exerciseData)
			return
		}
		if (inputAnswer instanceof Expression) {
			feedback[currParameter] = getExpressionComparisonFeedback(inputAnswer, correctAnswer, options, exerciseData)
			return
		}
		if (inputAnswer.constructor === Equation) {
			feedback[currParameter] = getExpressionComparisonFeedback(inputAnswer, correctAnswer, options, exerciseData) // Deal with Equations in the same way as Expressions.
			return
		}

		throw new Error(`Default feedback error: could not determine the type of parameter "${currParameter}". No comparison could be made.`)
	})

	// All done! Return feedback.
	return feedback
}

/* getNumberComparisonFeedback takes two Integers: a correct answer and an input answer. It then compares these and returns a feedback object in the form { correct: true/false, text: 'Some feedback text' }. Various options can be provided within the third parameter:
 * - equalityOptions: an object detailing how the comparison must be performed.
 * - checks: an array of feedback checks.
 * - text: an object with text for certain cases. It's the message if ...
 *   x correct: if it's correct.
 *   x sign: if it's incorrect due to the sign of the answer.
 *   x near: if it's near the answer.
 *   x tooLarge: if it's too high.
 *   x tooSmall: if it's too low.
 *   x wrongValue: a placeholder for both tooHigh and tooLow.
 *   x incorrect: if it's wrong for some unknown reason.
 */
export function getNumberComparisonFeedback(inputAnswer, correctAnswer, options, exerciseData) {
	options = processOptions(options, defaultComparisonOptions)
	const { equalityOptions, text, prevFeedback, solution, checks } = options

	// Do default comparison and check equality.
	const comparison = checkNumberEquality(inputAnswer, correctAnswer, equalityOptions)
	const correct = comparison.result

	// Walk through the feedback checks and see if one fires.
	const checkResult = getFeedbackCheckResult(checks, inputAnswer, correctAnswer, solution, correct, exerciseData)
	if (checkResult)
		return { correct, text: checkResult }

	// On a correct answer, use default feedback.
	if (correct)
		return { correct, text: (prevFeedback && prevFeedback.correct && prevFeedback.text) || selectRandomCorrect() }

	// Check the sign.
	if (Math.sign(correctAnswer.number) * Math.sign(inputAnswer.number) === -1)
		return { correct, text: text.sign || 'Je antwoord heeft niet het juiste teken. Controleer plussen en minnen.' }

	// Check for a near-hit.
	if (areNumbersEqual(inputAnswer, correctAnswer, { ...equalityOptions, accuracyFactor: (equalityOptions.accuracyFactor || 1) * accuracyFactorForNearHits }))
		return { correct, text: text.near || 'Je zit erg in de buurt! Maak je antwoord iets nauwkeuriger.' }

	// Check for default integer comparison elements.
	return { correct, text: getNumberComparisonFeedbackTextFromComparison(comparison, { ...options, answerSign: Math.sign(correctAnswer.number), inputSign: Math.sign(inputAnswer.number) }) }
}

/* getFloatComparisonFeedback takes two Floats: a correct answer and an input answer. It then compares these and returns a feedback object in the form { correct: true/false, text: 'Some feedback text' }. Various options can be provided within the third parameter:
 * - equalityOptions: an object detailing how the comparison must be performed.
 * - text: an object with text for certain cases. It's the message if ...
 *   x correct: if it's correct.
 *   x sign: if it's incorrect due to the sign of the answer.
 *   x near: if it's near the answer.
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
export function getFloatComparisonFeedback(inputAnswer, correctAnswer, options, exerciseData) {
	options = processOptions(options, defaultComparisonOptions)
	const { equalityOptions, text, prevFeedback, solution, checks } = options

	// Do default comparison and check equality.
	const comparison = correctAnswer.checkEquality(inputAnswer, equalityOptions)
	const correct = comparison.result

	// Walk through the feedback checks and see if one fires.
	const checkResult = getFeedbackCheckResult(checks, inputAnswer, correctAnswer, solution, correct, exerciseData)
	if (checkResult)
		return { correct, text: checkResult }

	// On a correct answer, use default feedback.
	if (correct)
		return { correct, text: (prevFeedback && prevFeedback.correct && prevFeedback.text) || selectRandomCorrect() }

	// Check sign.
	if (Math.sign(correctAnswer.number) * Math.sign(inputAnswer.number) === -1)
		return { correct, text: text.sign || 'Je antwoord heeft niet het juiste teken. Controleer plussen en minnen.' }

	// Check for a near-hit.
	if (correctAnswer.equals(inputAnswer, { ...equalityOptions, accuracyFactor: (equalityOptions.accuracyFactor || 1) * accuracyFactorForNearHits }))
		return { correct, text: text.near || 'Je zit erg in de buurt! Maak je antwoord iets nauwkeuriger.' }

	// Check for default float comparison elements.
	return { correct, text: getFloatComparisonFeedbackTextFromComparison(comparison, { ...options, answerSign: Math.sign(correctAnswer.number), inputSign: Math.sign(inputAnswer.number) }) }
}

// getFloatUnitComparisonFeedback is identical to getFloatComparisonFeedback, but then with two main differences: it uses FloatUnits, and it can also be provided a "unit" error message text in case the unit is wrong.
export function getFloatUnitComparisonFeedback(inputAnswer, correctAnswer, options, exerciseData) {
	options = processOptions(options, defaultComparisonOptions)
	const { equalityOptions, text, prevFeedback, solution, checks } = options

	// Do default comparison and check equality.
	const comparison = correctAnswer.checkEquality(inputAnswer, equalityOptions)
	const correct = comparison.result

	// Walk through the feedback checks and see if one fires.
	const checkResult = getFeedbackCheckResult(checks, inputAnswer, correctAnswer, solution, correct, exerciseData)
	if (checkResult)
		return { correct, text: checkResult }

	// On a correct answer, use default feedback.
	if (correct)
		return { correct, text: (prevFeedback && prevFeedback.correct && prevFeedback.text) || selectRandomCorrect() }

	// Check unit.
	if (!comparison.unitOK)
		return {
			correct,
			text: text.unit || selectRandomly([
				'Je eenheid klopt niet. Kijk daar eerst eens naar.',
				'Er zit een fout in je eenheid. Verbeter die eerst.',
				'Incorrecte eenheid. Welke eenheid moet je antwoord hebben?',
				'Oops, je eenheid zit ernaast. Check die even.',
			])
		}

	// Check sign.
	if (Math.sign(correctAnswer.float.number) * Math.sign(inputAnswer.float.number) === -1)
		return { correct, text: text.sign || 'Je antwoord heeft niet het juiste teken. Controleer plussen en minnen.' }

	// Check for a near-hit.
	if (correctAnswer.equals(inputAnswer, { ...equalityOptions, accuracyFactor: accuracyFactorForNearHits }))
		return { correct, text: text.near || 'Je zit erg in de buurt! Maak je antwoord iets nauwkeuriger.' }

	// Check for default float comparison elements.
	return { correct, text: getFloatComparisonFeedbackTextFromComparison(comparison, { ...options, answerSign: Math.sign(correctAnswer.float.number), inputSign: Math.sign(inputAnswer.float.number) }) }
}

// The functions below give feedback text based on a comparison result from a checkEquality function.
function getNumberComparisonFeedbackTextFromComparison(comparison, options) {
	// Check if we're too high or too low. On negative numbers flip the phrasing.
	if (comparison.magnitude !== 'OK') {
		if (options.inputSign === 0) {
			if (options.answerSign === -1)
				return options.tooLarge || options.wrongValue || 'Je antwoord is (qua absolute waarde) te klein.'
			else
				return options.tooSmall || options.wrongValue || 'Je antwoord is (qua absolute waarde) te klein.'
		} else if (options.inputSign === -1) {
			if (comparison.magnitude === 'TooLarge')
				return options.tooLarge || options.wrongValue || 'Je antwoord is (qua absolute waarde) te klein.'
			else
				return options.tooSmall || options.wrongValue || 'Je antwoord is (qua absolute waarde) te groot.'
		} else {
			if (comparison.magnitude === 'TooLarge')
				return options.tooLarge || options.wrongValue || 'Je antwoord is te groot.'
			else
				return options.tooSmall || options.wrongValue || 'Je antwoord is te klein.'
		}
	}
	// No problem found. Return nothing to indicate it's not the common faults that took place here.
}

function getFloatComparisonFeedbackTextFromComparison(comparison, options) {
	// Get feedback on the number.
	const feedbackText = getNumberComparisonFeedbackTextFromComparison(comparison, options)
	if (feedbackText)
		return feedbackText

	// Check the number of significant digits.
	if (comparison.numSignificantDigits !== 'OK') {
		if (comparison.numSignificantDigits === 'TooLarge')
			return options.tooManySignificantDigits || options.wrongSignificantDigits || 'Je hebt te veel significante getallen.'
		else
			return options.tooFewSignificantDigits || options.wrongSignificantDigits || 'Je hebt te weinig significante getallen.'
	}

	// Check the power. (In case it was examined.)
	if (comparison.power !== undefined && comparison.power !== 'OK') {
		if (comparison.power === 'TooLarge')
			return options.tooLargePower || options.wrongPower || 'De gebruikte tien-macht is te groot.'
		else
			return options.tooSmallPower || options.wrongPower || 'De gebruikte tien-macht is te klein.'
	}

	// Check other problems. (This should not happen.)
	return options.incorrect || selectRandomIncorrect()
}

// getExpressionComparisonFeedback attempts to get feedback for expressions. (It works also for equations.) It does this solely based on the feedbackChecks provided. If none of them fire, a generic message is given.
export function getExpressionComparisonFeedback(inputAnswer, correctAnswer, options, exerciseData) {
	options = processOptions(options, defaultComparisonOptions)
	const { comparison, text, solution, feedbackChecks } = options

	// Do default comparison and check equality.
	if (!comparison)
		throw new Error(`Missing comparison function: no comparison was provided to determine the correctness of the parameter. Keep in mind: when using the getFeedback function on expressions/equations, you must define a comparison function for each parameter in the shared data object. (Or provide a default one for all.)`)
	const correct = comparison(inputAnswer, correctAnswer, solution)

	// Walk through the feedback checks and see if one fires.
	const checkResult = getFeedbackCheckResult(feedbackChecks, inputAnswer, correctAnswer, solution, correct, exerciseData)
	if (checkResult)
		return { correct, text: checkResult }

	// No sensible feedback has matched. Give a default message.
	if (correct)
		return { correct, text: text.correct || selectRandomCorrect() }
	return { correct, text: text.incorrect || selectRandomIncorrect() }
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

/* getFeedbackCheckResult gets an array of feedback checks and various other data. It then runs through these feedback checks to see if one matches and returns the corresponding feedback.
 * The feedback checks must be an array of the form [(inputAnswer, correctAnswer, solution, isCorrect, exerciseData) => <>This is the feedback if the check matches.</>, ...].
 * The first feedback checks that returns something truthy will be used. The value given will be return. If no feedback check returns anything truthy, nothing (undefined) will be returned.
 */
function getFeedbackCheckResult(feedbackChecks, inputAnswer, correctAnswer, solution, isCorrect, exerciseData) {
	// Check the input.
	if (!feedbackChecks)
		return undefined
	if (!Array.isArray(feedbackChecks))
		throw new Error(`Invalid feedbackChecks parameter: the feedbackChecks parameter must be an array. Instead, something of type "${typeof feedbackChecks}" was given.`)

	// Find the first feedback check to return something truthy and return the resulting value.
	const result = arrayFind(feedbackChecks, (check) => check(inputAnswer, correctAnswer, solution, isCorrect, exerciseData))
	return result && result.value
}

/* getInputFieldListFeedback gets an array of parameters and attempts to give feedback for the respective input fields. The main difference is that the fields may not have to be in the same order as the fields in the solution field.
The extra options given must be a single object that holds for every parameter, or it is an array coupled to the solution indices. */
export function getInputFieldListFeedback(parameters, exerciseData, extraOptions = {}) {
	// Extract parameters and check that they are suitable.
	const { input, shared, solution } = exerciseData
	const { data } = shared
	if (!data)
		throw new Error(`Default feedback error: could not find a "data" parameter in the shared file.`)
	if (!solution)
		throw new Error(`Default feedback error: could not find a "getSolution" function exported from the shared file.`)

	// Extract the way in which the answers are compared.
	const { equalityOptions, comparison } = data
	const doValuesMatch = (inputParameter, solutionParameter) => input[inputParameter] !== undefined && performComparison([solutionParameter], { [solutionParameter]: input[inputParameter] }, { [solutionParameter]: solution[solutionParameter] }, { ...(equalityOptions || {}), ...(comparison || {}) })

	// Walk through the parameters and incorporate feedback.
	const feedback = {}
	const matched = parameters.map(() => false)
	parameters.forEach(inputParameter => { // For every element, find a matching partner.
		const index = parameters.findIndex((solutionParameter, index) => (!matched[index] && doValuesMatch(inputParameter, solutionParameter)))
		if (index !== -1) {
			matched[index] = true
			feedback[inputParameter] = { correct: true, text: extraOptions.correct || selectRandomCorrect() }
		} else {
			// If there is no unmatched partner, check if there potentially is an already matched partner.
			if (parameters.find((solutionParameter, solutionIndex) => (matched[solutionIndex] && doValuesMatch(inputParameter, solutionParameter))))
				feedback[inputParameter] = { correct: false, text: extraOptions.usedValue || <>Deze waarde is al gelijk aan een eerder gegeven oplossing.</> }
			else
				feedback[inputParameter] = { correct: false, text: extraOptions.wrongValue || selectRandomIncorrect() }
		}
	})
	return feedback
}