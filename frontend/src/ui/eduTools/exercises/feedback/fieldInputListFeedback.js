import { applyMapping } from 'step-wise/util'
import { performIndividualListComparison } from 'step-wise/eduTools'

import { selectRandomCorrect, selectRandomIncorrect, selectRandomDuplicate } from 'ui/inputs'

import { processParameterOptions } from './util'

/* getFieldInputListFeedback gets an array of parameters and attempts to give feedback for the respective input fields. The main difference is that the fields may not have to be in the same order as the fields in the solution field.
The extra options given can be an array with options for each parameter, or it can be single object that holds for every parameter. It may contain specific text to give on a "correct", a "wrongValue" case or a "usedValue" case. */
export function getFieldInputListFeedback(exerciseData, parameterOptions, generalOptions = {}) {
	parameterOptions = processParameterOptions(parameterOptions)

	// Define the way in which the answers are compared.
	const doValuesMatch = (inputParameter, solutionParameter) => performIndividualListComparison(inputParameter, solutionParameter, exerciseData, applyMapping(parameterOptions, options => options?.comparison), generalOptions?.comparison)

	// Walk through the parameters and try to find each one a matching partner. Incorporate feedback based on what is found.
	const feedback = {}
	const matched = Object.keys(parameterOptions).map(() => false)
	const parameters = Object.keys(parameterOptions)
	parameters.forEach(inputParameter => {
		// Extract input and options. Ignore parameters with no input.
		const currParameterOptions = parameterOptions[inputParameter]
		const currInput = exerciseData.input[inputParameter]
		if (currInput === undefined)
			return

		// Is there an unmatched corresponding partner?
		const solutionIndex = parameters.findIndex((solutionParameter, index) => (!matched[index] && doValuesMatch(inputParameter, solutionParameter)))
		if (solutionIndex !== -1) {
			// There is a corresponding partner. Register match and give correct feedback.
			matched[solutionIndex] = true
			feedback[inputParameter] = { correct: true, text: currParameterOptions.correct || generalOptions.correct || selectRandomCorrect() }
		} else {
			// If there is no unmatched corresponding partner, check if there potentially is an earlier matched corresponding partner. If so, note the duplicate. Otherwise it's just plain wrong.
			if (parameters.find((solutionParameter, solutionIndex) => (matched[solutionIndex] && doValuesMatch(inputParameter, solutionParameter))))
				feedback[inputParameter] = { correct: false, text: currParameterOptions.usedValue || generalOptions.usedValue || selectRandomDuplicate() }
			else
				feedback[inputParameter] = { correct: false, text: currParameterOptions.wrongValue || generalOptions.wrongValue || selectRandomIncorrect() }
		}
	})
	return feedback
}
