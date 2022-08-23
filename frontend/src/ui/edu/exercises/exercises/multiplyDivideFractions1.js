import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import ExpressionInput, { basicMath, validWithVariables } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/FormPart'

import { useSolution } from '../util/SolutionProvider'
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
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMath} validate={validWithVariables(variables)} />
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