import React from 'react'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { useSolution, SimpleExercise, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

const { originalExpression, noFraction, hasFractionWithinFraction, correctExpression, incorrectExpression } = expressionChecks

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, expression } = useSolution()
	return <>
		<Par>Gegeven is de uitdrukking <BM>{expression}.</BM> Schrijf dit als één breuk.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.basicMath} validate={ExpressionInput.validation.validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const Solution = ({ expression, ans }) => {
	return <>
		<Par>Het is bij deze opgave belangrijk om te kijken welke breuk voorrang heeft. Kleinere deelstrepen worden eerder uitgevoerd dan grotere deelstrepen, en krijgen dus voorrang. Effectief gezien delen we hier dus de som <M>{expression.numerator}</M> door de breuk <M>{expression.denominator}.</M></Par>
		<Par>Als we delen door een breuk, dan zegt de regel, "Delen door een breuk is vermenigvuldigen met het omgekeerde." Volgens deze regel zien we dat <BM>{expression} = {expression.numerator.multiply(expression.denominator.invert())}.</BM> Dit kunnen we vervolgens ook weer simpeler schrijven. Immers, als we een breuk ergens mee vermenigvuldigen, zoals met <M>{expression.numerator},</M> dan mogen we deze factor ook bij de teller (bovenin) erbij schrijven. Zo vinden we het resultaat <BM>{ans}.</BM></Par>
	</>
}

function getFeedback(exerciseData) {
	const feedbackChecks = [
		originalExpression,
		incorrectExpression,
		noFraction,
		hasFractionWithinFraction,
		correctExpression,
	]
	return getFieldInputFeedback(exerciseData, { ans: feedbackChecks })
}