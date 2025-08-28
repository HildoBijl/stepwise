import React from 'react'

import { Translation } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { SimpleExercise, useSolution, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

const { originalExpression, hasNegativeExponent, equivalentExpression, nonEquivalentExpression } = expressionChecks

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem() {
	const { expression } = useSolution()
	return <>
		<Par><Translation>Rewrite the number <M>{expression}</M> to a form without a negative exponent.</Translation></Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} size="l" settings={ExpressionInput.settings.numericRational} validate={ExpressionInput.validation.numeric} /></Par>
		</InputSpace>
	</>
}

function Solution({ expression, ans, simplified }) {
	return <Par><Translation>According to the rule <M>a^(-b) = \frac(1)(a^b)</M> we may directly rewrite the number to <BM>{expression} = {ans}.</BM> Optionally, we may simplify this further to <M>{simplified}</M>.</Translation></Par>
}

function getFeedback(exerciseData) {
	return getFieldInputFeedback(exerciseData, {
		ans: [
			originalExpression,
			hasNegativeExponent,
			nonEquivalentExpression,
			equivalentExpression,
		]
	})
}
