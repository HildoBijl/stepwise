
import { selectRandomly, selectRandomCorrect, selectRandomIncorrect } from 'step-wise/util/random'
import { processOptions, deepEquals } from 'step-wise/util/objects'
import { checkNumberEquality, areNumbersEqual } from 'step-wise/inputTypes/Integer'
import { Float } from 'step-wise/inputTypes/Float'
import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'
import { Expression, Equation } from 'step-wise/CAS'

const defaultComparisonOptions = {
	equalityOptions: {}, // Options with which to compare equality. Mainly used for comparing numbers/units.
	solved: undefined,
	text: {},
	prevInput: undefined,
	prevFeedback: undefined,
	correct: {}, // This will contain the full "correct" object returned from the getCorrect function. 
	check: undefined, // A check function that will be used to check for correctness. Mainly used for comparing expressions/equations.
	feedbackChecks: [], // Extra checks that can be performed to determine improved feedback.
}

const accuracyFactorForNearHits = 4

/* getInputFieldFeedback takes an array of parameter names (like ['p1', 'p2', 'V1', 'V2']) and provides feedback on these parameters. It is also possible to give a single parameter 'p1'.
 * Input is an array of parameter string IDs. The function uses the exerciseData input parameter to extract all the data from. Extra options for the comparison functions may be provided in the third argument. This can be an object with extra options if they're the same for all parameters, or an array with extra options per parameter if they differ.
 * There should be a data object and a getCorrect function in the shared file. The data object should have an equalityOptions object with equality options for all parameters. If a parameter has different equality options, it can be specified within this object. So, data: { equalityOptions: { ...optionsForMostParameters..., p1: { ...specificOptions... }, ... } }. 
 * The outcome is a feedback object for each respective parameter. So { p1: { correct: 'false', text: 'Nope!' }, p2: { ... } }.
 */
export function getInputFieldFeedback(parameter, exerciseData, extraOptions) {
	// Extract parameters and check that they are suitable.
	const { state, input, shared, prevInput, prevFeedback } = exerciseData
	const { data, getCorrect } = shared
	if (!data)
		throw new Error(`Default feedback error: could not find a "data" parameter in the shared file.`)
	if (!getCorrect || typeof getCorrect !== 'function')
		throw new Error(`Default feedback error: could not find a "getCorrect" function exported from the shared file.`)

	// Extract other data parameters that may be used.
	const { equalityOptions, check } = data

	// Extract correct answers. If we have a single parameter, adjust accordingly.
	let correct = getCorrect(state)
	const parameters = Array.isArray(parameter) ? parameter : [parameter]

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

		// Get the correct answer.
		let correctAnswer
		if (correct[currParameter] !== undefined)
			correctAnswer = correct[currParameter]
		else if (!Array.isArray(parameter))
			correctAnswer = correct
		if (correctAnswer === undefined)
			throw new Error(`Default feedback error: no correct answer for "${currParameter}" was passed from the getCorrect function.`)

		// Get potential equality options.
		let currEqualityOptions
		if (equalityOptions) {
			if (equalityOptions[currParameter] !== undefined)
				currEqualityOptions = equalityOptions[currParameter]
			else if (equalityOptions.default !== undefined)
				currEqualityOptions = equalityOptions.default
			else if (!Array.isArray(parameter))
				currEqualityOptions = equalityOptions
		}

		// Get potential checks.
		let currCheck
		if (check) {
			if (check[currParameter] !== undefined)
				currCheck = check[currParameter]
			else if (check.default !== undefined)
				currCheck = check.default
			else if (!Array.isArray(parameter))
				currCheck = check
		}

		// Get the extra options.
		const currExtraOptions = (Array.isArray(extraOptions) ? extraOptions[index] : extraOptions) || {}

		// Assemble the options for the comparison.
		const options = { equalityOptions: currEqualityOptions, check: currCheck, prevInput: prevInput[currParameter], prevFeedback: prevFeedback[currParameter], correct, ...currExtraOptions }

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
			feedback[currParameter] = getFloatComparisonFeedback(correctAnswer, inputAnswer, options, exerciseData)
			return
		}
		if (inputAnswer.constructor === FloatUnit) {
			feedback[currParameter] = getFloatUnitComparisonFeedback(correctAnswer, inputAnswer, options, exerciseData)
			return
		}
		if (inputAnswer instanceof Expression) {
			feedback[currParameter] = getExpressionComparisonFeedback(correctAnswer, inputAnswer, options, exerciseData)
			return
		}
		if (inputAnswer.constructor === Equation) {
			feedback[currParameter] = getExpressionComparisonFeedback(correctAnswer, inputAnswer, options, exerciseData) // Deal with Equations in the same way as Expressions.
			return
		}

		throw new Error(`Default feedback error: could not determine the type of parameter "${currParameter}". No comparison could be made.`)
	})

	// All done! Return feedback.
	return feedback
}

// getAllInputFieldsFeedback is a function that tries to give feedback about the provided input in as intelligent a manner as possible. It figures out for itself which fields to give input on.
export function getAllInputFieldsFeedback(exerciseData) {
	const inputFields = Object.keys(exerciseData.input)
	return getInputFieldFeedback(inputFields.length === 1 ? inputFields[0] : inputFields, exerciseData)
}

/* getNumberComparisonFeedback takes two Integers: a correct answer and an input answer. It then compares these and returns a feedback object in the form { correct: true/false, text: 'Some feedback text' }. Various options can be provided within the third parameter:
 * - equalityOptions: an object detailing how the comparison must be performed.
 * - solved: an overwrite, in case the server says it's correct or incorrect.
 * - checks: an array of checks of the form [{ check: (inputAnswer, correct) => true, text: 'This is shown then as feedback.' }]. The check function gets the given input answer and the given "correct" object returned from the getCorrect function. If it returns true (if the user made a specific type of mistake) then the text is returned as feedback.
 * - text: an object with text for certain cases. It's the message if ...
 *   x correct: if it's correct.
 *   x sign: if it's incorrect due to the sign of the answer.
 *   x near: if it's near the answer.
 *   x tooLarge: if it's too high.
 *   x tooSmall: if it's too low.
 *   x wrongValue: a placeholder for both tooHigh and tooLow.
 *   x incorrect: if it's wrong for some unknown reason.
 */
export function getNumberComparisonFeedback(correctAnswer, inputAnswer, options, exerciseData) {
	options = processOptions(options, defaultComparisonOptions)
	const { equalityOptions, solved, text, prevInput, prevFeedback, correct, checks } = options

	// Check if solved is set to true.
	if (solved === true)
		return { correct: true, text: text.correct || (prevFeedback && prevFeedback.correct && prevFeedback.text) || selectRandomCorrect() }

	// If no input is given, no feedback will be given.
	if (inputAnswer === undefined)
		return

	// Do default comparison and check equality.
	const comparison = checkNumberEquality(correctAnswer, inputAnswer, equalityOptions)
	if (comparison.result) {
		if (solved === false)
			return { correct: false, text: (prevFeedback && !prevFeedback.correct && prevFeedback.text) || selectRandomIncorrect() } // Overwritten! Apparently the answer is correct now, but the server marks it as incorrect. So we have to show incorrect.
		return { correct: true, text: (prevFeedback && prevFeedback.correct && prevFeedback.text) || selectRandomCorrect() }
	}

	// If we had exactly the same input before, return the same feedback.
	if (prevInput !== undefined && inputAnswer === prevInput)
		return prevFeedback

	// Walk through the checks and see if one matches.
	const checkText = getCheckFeedback(checks, inputAnswer, correct, exerciseData)
	if (checkText)
		return { correct: false, text: checkText }

	// Check sign.
	if (Math.sign(correctAnswer.number) * Math.sign(inputAnswer.number) === -1)
		return {
			correct: false,
			text: text.sign || 'Je antwoord heeft niet het juiste teken. Controleer plussen en minnen.',
		}

	// Check for a near-hit.
	if (areNumbersEqual(correctAnswer, inputAnswer, { ...equalityOptions, accuracyFactor: (equalityOptions.accuracyFactor || 1) * accuracyFactorForNearHits }))
		return {
			correct: false,
			text: text.near || 'Je zit erg in de buurt! Maak je antwoord iets nauwkeuriger.',
		}

	// Check for default integer comparison elements.
	return {
		correct: false,
		text: getNumberComparisonFeedbackTextFromComparison(comparison, { ...options, answerSign: Math.sign(correctAnswer.number), inputSign: Math.sign(inputAnswer.number) }),
	}
}

/* getFloatComparisonFeedback takes two Floats: a correct answer and an input answer. It then compares these and returns a feedback object in the form { correct: true/false, text: 'Some feedback text' }. Various options can be provided within the third parameter:
 * - equalityOptions: an object detailing how the comparison must be performed.
 * - solved: an overwrite, in case the server says it's correct or incorrect.
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
export function getFloatComparisonFeedback(correctAnswer, inputAnswer, options, exerciseData) {
	options = processOptions(options, defaultComparisonOptions)
	const { equalityOptions, solved, text, prevInput, prevFeedback, correct, checks } = options

	// Check if solved is set to true.
	if (solved === true)
		return { correct: true, text: text.correct || (prevFeedback && prevFeedback.correct && prevFeedback.text) || selectRandomCorrect() }

	// If no input is given, no feedback will be given.
	if (inputAnswer === undefined)
		return

	// If we had exactly the same input before, return the same feedback.
	if (prevInput && inputAnswer.str === prevInput.str)
		return prevFeedback

	// Walk through the checks and see if one matches.
	const checkText = getCheckFeedback(checks, inputAnswer, correct, exerciseData)
	if (checkText)
		return { correct: false, text: checkText }

	// Do default comparison and check equality.
	const comparison = correctAnswer.checkEquality(inputAnswer, equalityOptions)
	if (comparison.result) {
		if (solved === false)
			return { correct: false, text: (prevFeedback && !prevFeedback.correct && prevFeedback.text) || selectRandomIncorrect() } // Overwritten! Apparently the answer is correct now, but the server marks it as incorrect. So we have to show incorrect.
		return { correct: true, text: (prevFeedback && prevFeedback.correct && prevFeedback.text) || selectRandomCorrect() }
	}

	// Check sign.
	if (Math.sign(correctAnswer.number) * Math.sign(inputAnswer.number) === -1)
		return {
			correct: false,
			text: text.sign || 'Je antwoord heeft niet het juiste teken. Controleer plussen en minnen.',
		}

	// Check for a near-hit.
	if (correctAnswer.equals(inputAnswer, { ...equalityOptions, accuracyFactor: (equalityOptions.accuracyFactor || 1) * accuracyFactorForNearHits }))
		return {
			correct: false,
			text: text.near || 'Je zit erg in de buurt! Maak je antwoord iets nauwkeuriger.',
		}

	// Check for default float comparison elements.
	return {
		correct: false,
		text: getFloatComparisonFeedbackTextFromComparison(comparison, { ...options, answerSign: Math.sign(correctAnswer.number), inputSign: Math.sign(inputAnswer.number) }),
	}
}

// getFloatUnitComparisonFeedback is identical to getFloatComparisonFeedback, but then with two main differences: it uses FloatUnits, and it can also be provided a "unit" error message text in case the unit is wrong.
export function getFloatUnitComparisonFeedback(correctAnswer, inputAnswer, options, exerciseData) {
	options = processOptions(options, defaultComparisonOptions)
	const { equalityOptions, solved, text, prevInput, prevFeedback, correct, checks } = options

	// Check if solved is set to true. If so, always return positive feedback.
	if (solved === true)
		return { correct: true, text: text.correct || (prevFeedback && prevFeedback.correct && prevFeedback.text) || selectRandomCorrect() }

	// If no input is given, no feedback will be given.
	if (inputAnswer === undefined)
		return

	// If we had exactly the same input before, return the same feedback.
	if (prevInput && inputAnswer.str === prevInput.str)
		return prevFeedback

	// Walk through the checks and see if one matches.
	const checkText = getCheckFeedback(checks, inputAnswer, correct, exerciseData)
	if (checkText)
		return { correct: false, text: checkText }

	// Do default comparison and check equality.
	const comparison = correctAnswer.checkEquality(inputAnswer, equalityOptions)
	if (comparison.result) {
		if (solved === false)
			return { correct: false, text: (prevFeedback && !prevFeedback.correct && prevFeedback.text) || selectRandomIncorrect() } // Overwritten! Apparently the answer is correct now, but the server marks it as incorrect. So we have to show incorrect.
		return { correct: true, text: (prevFeedback && prevFeedback.correct && prevFeedback.text) || selectRandomCorrect() }
	}

	// Check unit.
	if (!comparison.unitOK)
		return {
			correct: false,
			text: text.unit || selectRandomly([
				'Je eenheid klopt niet. Kijk daar eerst eens naar.',
				'Er zit een fout in je eenheid. Verbeter die eerst.',
				'Incorrecte eenheid. Welke eenheid moet je antwoord hebben?',
				'Oops, je eenheid zit ernaast. Check die even.',
			])
		}

	// Check sign.
	if (Math.sign(correctAnswer.float.number) * Math.sign(inputAnswer.float.number) === -1)
		return {
			correct: false,
			text: text.sign || 'Je antwoord heeft niet het juiste teken. Controleer plussen en minnen.',
		}

	// Check for a near-hit.
	if (correctAnswer.equals(inputAnswer, { ...equalityOptions, accuracyFactor: accuracyFactorForNearHits }))
		return {
			correct: false,
			text: text.near || 'Je zit erg in de buurt! Maak je antwoord iets nauwkeuriger.',
		}

	// Check for default float comparison elements.
	return {
		correct: false,
		text: getFloatComparisonFeedbackTextFromComparison(comparison, { ...options, answerSign: Math.sign(correctAnswer.float.number), inputSign: Math.sign(inputAnswer.float.number) }),
	}
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

// getExpressionComparisonFeedback attempts to get feedback for expressions. (It works also for equations.) It first checks the given feedbackChecks. If none of them match, it uses the check function from the shared data to check general correctness, fixing a placeholder feedback.
export function getExpressionComparisonFeedback(correctAnswer, inputAnswer, options, exerciseData) {
	options = processOptions(options, defaultComparisonOptions)
	const { check, solved, text, prevInput, prevFeedback, correct, feedbackChecks } = options

	// If no input is given, no feedback will be given.
	if (inputAnswer === undefined)
		return

	// If we had exactly the same input before, return the same feedback.
	if (prevInput && deepEquals(inputAnswer.SO, prevInput.SO))
		return prevFeedback

	// Check if the solution is correct.
	if (!check)
		throw new Error(`Missing check function: no check was provided to determine the correctness of the parameter. Keep in mind: when using the getFeedback function on expressions/equations, you must define a check function for each parameter in the shared data object. (Or provide a default one for all.)`)
	const isCorrect = (solved !== undefined ? solved : check(correctAnswer, inputAnswer, correct))

	// Walk through the feedback checks and see if one matches. Run an extra check to see if its correctness is appropriate.
	const checkResult = getCheckFeedback(feedbackChecks, correctAnswer, inputAnswer, correct, exerciseData)
	if (checkResult) {
		if (checkResult.correct === isCorrect)
			return checkResult
	}

	// No sensible feedback has matched. Give a default message.
	if (isCorrect)
		return { correct: true, text: text.correct || selectRandomCorrect() }
	return { correct: false, text: text.incorrect || selectRandomIncorrect() }
}

/* getMCFeedback provides a default feedback for multiple choice input fields. Currently this only works for single-input multiple choice and not multi-input. Parameters are:
 * - name: the name of the field.
 * - exerciseData: all the data for the exercise in the standard format.
 * - options: an object with options.
 * The options object can contain the following.
 * - correct: the correct answer. It is used to determine if the given input is correct or not. If it is not given, it is attempted to be pulled out of the getCorrect function.
 * - done: whether the question is done. If so, the correct answer will be displayed.
 * - step: if provided, the progress object is used to determine whether this question is done. Only used if "done" is not given.
 * - substep: if provided, the corresponding substep is checked.
 * - text: the text corresponding to each option, if it is selected. This is usually an array of strings/JSXs. If it is not an array, the given text is simply always shown.
 * - correctText: the text that is used upon a correct answer, if no text is given.
 * - incorrectText: the text that is used upon an incorrect answer, if no text is given.
 * The object returned is of the form { [name]: { 0: { correct: false, text: 'Wrong!' }, 1: { correct: true } } }
 */
export function getMCFeedback(name, exerciseData, options = {}) {
	const { input, state, progress, shared } = exerciseData
	let { correct, done, step, substep, text, correctText, incorrectText } = options

	// Attempt to get correct answer if not given.
	if (correct === undefined) {
		const { getCorrect } = shared
		if (getCorrect)
			correct = getCorrect(state)[name]
	}

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

/* getCheckFeedback gets an array of feedback checks and various other data. It then runs through these feedback checks to see if one matches and returns the corresponding feedback.
 * The feedback checks must be an array of the form [{ check: (correctAnswer, inputAnswer, correctObj, exerciseData) => true/false, text: <>This is the feedback if the check matches.</>, correct: false }].
* The correct parameter in each feedback check is optional: if not present it is assumed false.
* The text and the correct parameter may also be functions, like "(correctAnswer, inputAnswer, correctObj, exerciseData) => <>Some <M>{correctObj.x}</M> message about <M>{inputAnswer.left}</M>.</>".
* The result of this function is a feedback object of the form { correct: false, text: <>Some feedback text.</> }. If no check matches, undefined is returned.
 */
function getCheckFeedback(feedbackChecks, correctAnswer, inputAnswer, correct, exerciseData) {
	const matchingFeedbackCheck = feedbackChecks.find(checkObj => checkObj.check(correctAnswer, inputAnswer, correct, exerciseData))
	if (!matchingFeedbackCheck)
		return undefined
	return {
		correct: matchingFeedbackCheck.correct ? (
			typeof matchingFeedbackCheck.correct === 'function' ?
				matchingFeedbackCheck.correct(correctAnswer, inputAnswer, correct, exerciseData) :
				matchingFeedbackCheck.correct
		) : false, // Upon false or undefined, use false, since false is default.
		text: typeof matchingFeedbackCheck.text === 'function' ?
			matchingFeedbackCheck.text(correctAnswer, inputAnswer, correct, exerciseData) :
			matchingFeedbackCheck.text,
	}
}