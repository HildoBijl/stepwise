import React from 'react'

import { Par, M, BM } from 'ui/components'
import ExpressionInput, { basicMathNoFractions, validWithVariables } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/FormPart'

import { useSolution } from '../util/SolutionProvider'
import SimpleExercise from '../types/SimpleExercise'

import { getInputFieldFeedback } from '../util/feedback'
import { originalExpression, sumWithWrongTerms, hasSumWithinProduct, correctExpression, incorrectExpression } from '../util/feedbackChecks/expression'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, expression } = useSolution()
	return <>
		<Par>Gegeven is de uitdrukking <BM>{expression}.</BM> Werk de haakjes uit.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMathNoFractions} validate={validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const Solution = () => {
	const { before, factor, sum, expression, ans } = useSolution()
	const intermediate = factor.multiply(sum.terms[0], before).add(factor.multiply(sum.terms[1], before))
	return <Par>Om de haakjes uit te werken vermenigvuldigen we de term buiten haakjes <M>{factor}</M> los met elk van de termen binnen haakjes <M>{sum.terms[0]}</M> en <M>{sum.terms[1]}.</M> Zo krijgen we <BM>{expression} = {intermediate}.</BM> Dit kan eventueel (niet verplicht, wel handig) simpeler geschreven worden als <BM>{expression} = {ans}.</BM></Par>
}

function getFeedback(exerciseData) {
	const feedbackChecks = [
		originalExpression,
		hasSumWithinProduct,
		sumWithWrongTerms,
		incorrectExpression,
		correctExpression,
	]
	return getInputFieldFeedback('ans', exerciseData, { feedbackChecks })
}