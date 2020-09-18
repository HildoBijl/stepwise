import { selectRandomCorrect, selectRandomIncorrect } from 'step-wise/util/random'

// getFloatComparisonFeedback takes two floats: a correct answer and an input answer. It then compares these using the given equality options and returns a feedback text.
export function getFloatComparisonFeedback(correctAnswer, inputAnswer, equalityOptions = {}) {
	// Do default comparison and check equality.
	const comparison = correctAnswer.checkEquality(inputAnswer, equalityOptions)
	if (comparison.result)
		return selectRandomCorrect()

	// Check sign.
	if (Math.sign(correctAnswer.number) !== Math.sign(inputAnswer.number))
		return 'Je antwoord heeft niet het juiste teken. Controleer plussen en minnen.'

	// Check for a near-hit.
	if (correctAnswer.equals(inputAnswer, { ...equalityOptions, accuracyFactor: 4 }))
		return 'Je zit erg in de buurt! Maak je antwoord iets nauwkeuriger.'

	// Check if we're too high or too low. On negative numbers flip the phrasing.
	if (comparison.magnitude !== 'OK') {
		if (Math.sign(inputAnswer) === -1)
			return `Je antwoord is (qua absolute waarde) te ${comparison.magnitude === 'TooLarge' ? 'klein' : 'groot'}.`
		return `Je antwoord is te ${comparison.magnitude === 'TooLarge' ? 'groot' : 'klein'}.`
	}

	if (comparison.numSignificantDigits !== 'OK')
		return `Je hebt te ${comparison.numSignificantDigits === 'TooLarge' ? 'veel' : 'weinig'} significante getallen.`

	if (comparison.power !== undefined && comparison.power !== 'OK')
		return `De gebruikte tien-macht is te ${comparison.power === 'TooLarge' ? 'groot' : 'klein'}.`

	return selectRandomIncorrect() // Should not happen.
}

// getFloatUnitEqualityFeedbackText takes a comparison object from a FloatUnit equality check and turns it into a sensible feedback text for the user to read.
export function getFloatUnitEqualityFeedbackText(comparison) {
	// ToDo: consider expanding this into a comparison-like function like for Floats.

	if (comparison.result)
		return selectRandomCorrect()

	if (!comparison.unitOK)
		return `Je eenheid klopt al niet. Kijk daar eerst eens naar.`

	if (comparison.magnitude !== 'OK')
		return `Je eenheid klopt maar je getal is te ${comparison.magnitude === 'TooLarge' ? 'groot' : 'klein'}.`

	if (comparison.numSignificantDigits !== 'OK')
		return `Je hebt te ${comparison.numSignificantDigits === 'TooLarge' ? 'veel' : 'weinig'} significante getallen.`

	return selectRandomIncorrect() // Should not happen.
}