
import { selectRandomly, selectRandomCorrect, selectRandomIncorrect } from 'step-wise/util/random'
import { processOptions } from 'step-wise/util/objects'
import { equals } from 'step-wise/inputTypes'

const defaultComparisonOptions = {
	equalityOptions: {},
	solved: undefined,
	text: {},
	prevInput: undefined,
	prevFeedback: undefined,
}

const accuracyFactorForNearHits = 4

/* getFloatComparisonFeedback takes two Floats: a correct answer and an input answer. It then compares these and returns a feedback object in the form { correct: true/false, text: 'Some feedback text' }. Various options can be provided within the third parameter:
 * - equalityOptions: an object detailing how the comparison must be performed.
 * - correct: an overwrite, in case the server says it's correct or incorrect.
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
export function getFloatComparisonFeedback(correctAnswer, inputAnswer, options) {
	options = processOptions(options, defaultComparisonOptions)
	const { equalityOptions, solved, text, prevInput, prevFeedback } = options

	// If a previous input is given, and it equals the current input, then keep the previous feedback.
	if (prevInput && equals(prevInput, inputAnswer))
		return prevFeedback

	// Check if correct is set to true.
	if (solved === true)
		return { correct: true, text: text.correct || selectRandomCorrect() }

	// If no input is given, no feedback will be given.
	if (inputAnswer === undefined)
		return

	// Do default comparison and check equality.
	const comparison = correctAnswer.checkEquality(inputAnswer, equalityOptions)
	if (comparison.result) {
		if (solved === false)
			return { correct: false, text: selectRandomIncorrect() } // Overwritten! Apparently the answer is correct now, but the server marks it as incorrect. So we have to show incorrect.
		return { correct: true, text: selectRandomCorrect() }
	}

	// Check sign.
	if (Math.sign(correctAnswer.number) * Math.sign(inputAnswer.number) === -1)
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
		text: getFloatComparisonFeedbackTextFromComparison(comparison, { ...options, answerSign: Math.sign(correctAnswer.number), inputSign: Math.sign(inputAnswer.number) }),
	}
}

// getFloatUnitComparisonFeedback is identical to getFloatComparisonFeedback, but then with two main differences: it uses FloatUnits, and it can also be provided a "unit" error message text in case the unit is wrong.
export function getFloatUnitComparisonFeedback(correctAnswer, inputAnswer, options) {
	options = processOptions(options, defaultComparisonOptions)
	const { equalityOptions, solved, text, prevInput, prevFeedback } = options

	// If a previous input is given, and it equals the current input, then keep the previous feedback.
	if (prevInput && equals(prevInput, inputAnswer))
		return prevFeedback

	// Check if correct is set to true.
	if (solved === true)
		return { correct: true, text: text.correct || selectRandomCorrect() }

	// If no input is given, no feedback will be given.
	if (inputAnswer === undefined)
		return

	// Do default comparison and check equality.
	const comparison = correctAnswer.checkEquality(inputAnswer, equalityOptions)
	if (comparison.result) {
		if (solved === false)
			return { correct: false, text: selectRandomIncorrect() } // Overwritten! Apparently the answer is correct now, but the server marks it as incorrect. So we have to show incorrect.
		return { correct: true, text: selectRandomCorrect() }
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

function getFloatComparisonFeedbackTextFromComparison(comparison, options) {
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