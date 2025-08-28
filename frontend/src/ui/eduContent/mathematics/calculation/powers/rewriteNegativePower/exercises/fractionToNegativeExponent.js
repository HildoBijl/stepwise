import React from 'react'

import { Translation } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { SimpleExercise, useSolution, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

const { originalExpression, hasFraction, equivalentExpression, nonEquivalentExpression } = expressionChecks

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem() {
	const { expression } = useSolution()
	return <Translation>
		<Par>Rewrite the number <M>{expression}</M> to a form without a fraction.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.numericRational} validate={ExpressionInput.validation.numeric} /></Par>
		</InputSpace>
	</Translation>
}

function Solution({ expression, ans, simplified }) {
	return <Translation><Par>According to the rule <M>a^(-b) = \frac(1)(a^b)</M> we may directly rewrite the fraction using a negative exponent as <BM>{expression} = {ans}.</BM></Par></Translation>
}

function getFeedback(exerciseData) {
	return getFieldInputFeedback(exerciseData, {
		ans: [
			originalExpression,
			hasFraction,
			nonEquivalentExpression,
			equivalentExpression,
		]
	})
}
