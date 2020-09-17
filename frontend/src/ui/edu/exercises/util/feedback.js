import { selectRandomCorrect, selectRandomIncorrect } from 'step-wise/util/random'

// getFloatUnitEqualityFeedbackText takes a result object from a FloatUnit equality check and turns it into a sensible feedback text for the user to read.
export function getFloatUnitEqualityFeedbackText(result) {
	if (result.result)
		return selectRandomCorrect()

	if (!result.unitOK)
		return `Je eenheid klopt al niet. Kijk daar eerst eens naar.`

	if (result.magnitude !== 'OK')
		return `Je eenheid klopt maar je getal is te ${result.magnitude === 'TooLarge' ? 'groot' : 'klein'}.`

	if (result.numSignificantDigits !== 'OK')
		return `Je hebt te ${result.numSignificantDigits === 'TooLarge' ? 'veel' : 'weinig'} significante getallen.`

	return selectRandomIncorrect() // Should not happen.
}