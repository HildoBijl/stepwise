import React from 'react'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'

import { useSolution } from 'ui/eduTools'
import SimpleExercise from '../types/SimpleExercise'

import { getInputFieldFeedback } from '../util/feedback'
import { originalExpression, noFraction, hasFractionWithinFraction, correctExpression, incorrectExpression } from '../util/feedbackChecks/expression'

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

const Solution = () => {
	const { variables, expression, ans } = useSolution()
	return <Par>Als je een breuk met een factor als <M>{variables.y}</M> vermenigvuldigt, dan komt die factor er bij de teller (bovenin) bij. Net zo geldt: als je een breuk met een breuk vermenigvuldigt, dan vermenigvuldig je los de tellers (bovenkanten) met elkaar en de noemers (onderkanten) met elkaar. Volgens deze regels vinden we <BM>{expression} = {ans}.</BM> Dit is al een correct antwoord, maar het kan eventuaal nog iets netter/simpeler geschreven worden als <BM>{expression.regularClean()}.</BM></Par>
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