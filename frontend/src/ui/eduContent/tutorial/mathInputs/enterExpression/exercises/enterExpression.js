import React from 'react'

import { expressionComparisons } from 'step-wise/CAS'

import { Translation } from 'i18n'
import { Par, M } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { SimpleExercise, getFieldInputFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ expression }) {
	return <Translation>
		<Par>Enter the expression <M>{expression}</M> exactly as shown.</Par>
		<InputSpace>
			<Par><ExpressionInput id="ans" prelabel={<M>{expression} =</M>} label="Enter the expression here" size="l" validate={ExpressionInput.validation.validWithVariables(expression.getVariables())} /></Par>
		</InputSpace>
	</Translation>
}

function Solution({ expression }) {
	return <Translation><Par>There isn't much to show for a solution. You simply have to type <M>{expression}</M> into the input field, without any changes. (A multiplication sign does not matter; that one is generally implicit anyway.) You can use either a computer keyboard or the web-app-internal keyboard for smartphones, or a combination of both.</Par></Translation>
}

function getFeedback(exerciseData) {
	const { translate } = exerciseData
	return getFieldInputFeedback(exerciseData, {
		ans: [
			(input, solution, _, correct) => !correct && expressionComparisons.equivalent(input, solution) && translate(<>Technically this is equivalent to the expression above, but you must enter the expression <strong>as shown</strong>.</>, 'equivalent'),
			(input, solution, _, correct) => !correct && translate(<>This is not equal to the expression shown above.</>, 'remaining'),
		]
	})
}
