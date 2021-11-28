import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import ExpressionInput, { basicMath, validWithVariables } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/Status'

import { useSolution } from '../ExerciseContainer'
import SimpleExercise from '../types/SimpleExercise'

import { getInputFieldFeedback } from '../util/feedback'
import { originalExpression, noFraction, hasFractionWithinFraction, correctExpression, incorrectExpression } from '../util/feedbackChecks/expression'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { variables, expression } = useSolution(state)
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
	const { expression, ans } = useSolution(state)
	return <>
		<Par>Het is bij deze opgave belangrijk om te kijken welke breuk voorrang heeft. Kleinere deelstrepen worden eerder uitgevoerd dan grotere deelstrepen, en krijgen dus voorrang. Effectief gezien delen we hier dus de breuk <M>{expression.numerator}</M> door <M>\left({expression.denominator}\right).</M></Par>
		<Par>Als we een breuk ergens door delen, dan is de regel dat we deze deelfactor er ook bij de noemer (onderin) bij mogen schrijven. Immers, als we bijvoorbeeld <M>1/2</M> taart hebben, en dat nog eens delen door <M>3,</M> dan hebben we <M>\frac(1/2)(3) = \frac(1)(2 \cdot 3) = \frac(1)(6)</M> taart. Volgens deze regel krijgen we <BM>{expression} = {ans}.</BM> Zo is onze samengestelde breuk geschreven als één breuk.</Par>
		<Par>Een andere manier om tot hetzelfde te komen is via de regel "Delen door een breuk is vermenigvuldigen met het omgekeerde." We kunnen de deelfactor <M>{expression.denominator}</M> immers ook schrijven als <M>{expression.denominator.divideBy(1)}.</M> En als we met het omgekeerde hiervan vermenigvuldigen, dan vinden we
			<BM>\frac({expression.numerator})({expression.denominator.divideBy(1)}) = {expression.numerator.multiplyBy(expression.denominator.divideBy(1).invert())} = {ans}.</BM></Par>
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