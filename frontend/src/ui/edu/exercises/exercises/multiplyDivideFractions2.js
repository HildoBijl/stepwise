import React from 'react'

import { simplifyOptions } from 'step-wise/CAS'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import ExpressionInput, { basicMath, validWithVariables } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/Status'

import { useCorrect } from '../ExerciseContainer'
import SimpleExercise from '../types/SimpleExercise'

import { getInputFieldFeedback } from '../util/feedback'
import { originalExpression, noFraction, hasFractionWithinFraction, correctExpression, incorrectExpression } from '../util/feedbackChecks'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { variables, expression } = useCorrect(state)
	return <>
		<Par>Gegeven is de uitdrukking <BM>{expression}.</BM> Schrijf dit als één breuk.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMath} validate={validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const Solution = (state) => {
	const { expression, ans } = useCorrect(state)
	return <>
		<Par>Het is bij deze opgave belangrijk om te kijken welke breuk voorrang heeft. Kleinere deelstrepen worden eerder uitgevoerd dan grotere deelstrepen, en krijgen dus voorrang. Effectief gezien delen we hier dus de breuk <M>{expression.numerator}</M> door de breuk <M>{expression.denominator}.</M></Par>
		<Par>Als we delen door een breuk, dan zegt de regel, "Delen door een breuk is vermenigvuldigen met het omgekeerde." Volgens deze regel zien we dat <BM>{expression} = {expression.numerator.multiplyBy(expression.denominator.invert())}.</BM> Deze breuken kunnen we vervolgens samenvoegen volgens de regels van breukvermenigvuldigingen: vermenigvuldig los de tellers (bovenin) bij elkaar en de noemers (onderin) bij elkaar. Hiermee vinden we het resultaat <BM>{ans}.</BM> Eventueel kunnen we dit nog iets netter schrijven als <BM>{ans.simplify(simplifyOptions.regularClean)}.</BM></Par>
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

	return getInputFieldFeedback('ans', exerciseData, { feedbackChecks })
}