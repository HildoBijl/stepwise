import { applyMapping } from 'step-wise/util'

import { selectRandomCorrect, selectRandomIncorrect } from 'util/feedbackMessages'
import { getIcon, getFeedbackColor } from 'ui/theme'

/* processFeedback takes a feedback object of a variable form and turns it into the standard form the input fields expect. Input can be of the form:
 * - undefined: don't display feedback.
 * - true/false: a boolean just indicates whether something is correct or not.
 * - { correct: true/false, text: 'Some string or React object.' }
 * - { correct: true, text: 'Some general text', subfields: { subfield1: { correct: true, text: 'This one is correct' }, subfield2: { correct: false, text: 'This one is not' } } }
 * - or adaptations of the above.
 * The output will always be of the form { type: 'warning', text: 'Some message (possibly empty) or React element.', icon: Icon, color: '#abcdef' }.
 * Optionally, the function can also receive previousRawFeedback and previousProcessedFeedback. If the raw feedback then is the same as the raw feedback now, the processed feedback is kept.
 */
export function processFeedback(feedback, theme) {
	// If the feedback is undefined, return undefined.
	if (feedback === undefined)
		return undefined

	// If the feedback is boolean, set up the corresponding object.
	if (typeof feedback === 'boolean')
		feedback = { correct: feedback }

	// If there is a correct parameter, use this to set the type and text.
	if (feedback.correct !== undefined) {
		feedback = {
			type: feedback.correct ? 'success' : 'error',
			text: feedback.correct ? selectRandomCorrect() : selectRandomIncorrect(),
			...feedback, // Allow the option to override the above values.
		}
		delete feedback.correct
	}

	// If by now we do not know the feedback, the feedback has not been implemented properly. Throw an error.
	if (!feedback.text && !feedback.subfields)
		throw new Error(`Invalid feedback: some feedback was attempted to be given, but no feedback text is known. Cannot process/display this feedback. Received was "${JSON.stringify(feedback)}".`)

	// If there is feedback, make sure it has a type, icon and color.
	if (feedback.text) {
		if (!feedback.type)
			feedback = { ...feedback, type: 'info' } // Apply default type on missing type.
		feedback = addIconAndColor(feedback, theme)
	}

	// If there are subfields, recursively process said subfields.
	if (feedback.subfields) {
		feedback.subfields = applyMapping(feedback.subfields, subfieldFeedback => processFeedback(subfieldFeedback, theme))
	}
	
	// All done!
	return feedback
}

// addIconAndColor takes a feedback object with a type. It then adds the icon and color to that feedback, based on default settings, if not already provided.
export function addIconAndColor(feedback, theme) {
	const { type } = feedback
	return {
		Icon: getIcon(type),
		color: getFeedbackColor(type, theme),
		...feedback, // Allow the option to override this.
	}
}
