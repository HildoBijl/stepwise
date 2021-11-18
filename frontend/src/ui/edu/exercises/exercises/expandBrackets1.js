import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import ExpressionInput, { basicMathNoFractions, validWithVariables } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/Status'

import { useCorrect } from '../ExerciseContainer'
import SimpleExercise from '../types/SimpleExercise'

import { getInputFieldFeedback } from '../util/feedback'
import { originalExpression, hasSumWithinProduct, correctExpression, incorrectExpression } from '../util/feedbackChecks'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { variables, expression } = useCorrect(state)
	return <>
		<Par>Gegeven is de uitdrukking <BM>{expression}.</BM> Werk de haakjes uit.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMathNoFractions} validate={validWithVariables(Object.values(variables))} />
			</Par>
		</InputSpace>
	</>
}

const Solution = (state) => {
	const { before, factor, sum, expression, ans } = useCorrect(state)
	const intermediate = factor.multiplyBy(sum.terms[0], before).add(factor.multiplyBy(sum.terms[1], before))
	return <Par>Om de haakjes uit te werken vermenigvuldigen we de term buiten haakjes <M>{factor}</M> los met elk van de termen binnen haakjes <M>{sum.terms[0]}</M> en <M>{sum.terms[1]}.</M> Zo krijgen we <BM>{expression} = {intermediate}.</BM> Dit kan eventueel (niet verplicht, wel handig) simpeler geschreven worden als <BM>{expression} = {ans}.</BM></Par>
}

function getFeedback(exerciseData) {
	const feedbackChecks = [
		originalExpression,
		incorrectExpression,
		hasSumWithinProduct,
		correctExpression,
	]
	return getInputFieldFeedback('ans', exerciseData, { feedbackChecks })
}