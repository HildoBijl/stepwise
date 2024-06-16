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
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.withFractions} validate={ExpressionInput.validation.validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const Solution = ({ expression, ans }) => {
	return <>
		<Par>Het is bij deze opgave belangrijk om te kijken welke breuk voorrang heeft. Kleinere deelstrepen worden eerder uitgevoerd dan grotere deelstrepen, en krijgen dus voorrang. Effectief gezien delen we hier dus de breuk <M>{expression.numerator}</M> door de breuk <M>{expression.denominator}.</M></Par>
		<Par>Als we delen door een breuk, dan zegt de regel, "Delen door een breuk is vermenigvuldigen met het omgekeerde." Volgens deze regel zien we dat <BM>{expression} = {expression.numerator.multiply(expression.denominator.invert())}.</BM> Deze breuken kunnen we vervolgens samenvoegen volgens de regels van breukvermenigvuldigingen: vermenigvuldig los de tellers (bovenin) bij elkaar en de noemers (onderin) bij elkaar. Hiermee vinden we het resultaat <BM>{ans}.</BM> Eventueel kunnen we dit nog iets netter schrijven als <BM>{ans.regularClean()}.</BM></Par>
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