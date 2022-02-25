import React from 'react'

import { Integer, expressionChecks } from 'step-wise/CAS'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import ExpressionInput, { basicMathAndPowers, validWithVariables } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/Status'

import { useSolution } from '../ExerciseContainer'
import SimpleExercise from '../types/SimpleExercise'

import { getInputFieldFeedback } from '../util/feedback'
import { originalExpression, correctExpression, incorrectExpression } from '../util/feedbackChecks/expression'

const { onlyOrderChanges } = expressionChecks

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { variables, expression } = useSolution(state)
	return <>
		<Par>Gegeven is de breuk <BM>{expression}.</BM> Streep gemeenschappelijke factoren in de teller/noemer weg. Simplificeer het resultaat zo veel mogelijk.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const Solution = (state) => {
	const { upper, sum, expression, ans } = useSolution(state)
	if (upper)
		return <Par>Zowel de teller als de noemer bevat een factor <M>{sum}.</M> Deze kan dus boven en onder weggelaten worden. Als we de noemer door <M>{sum}</M> delen, dan blijft er <M>1</M> over. Zo vinden we <BM>{expression} = \frac({ans})(1).</BM> Delen door <M>1</M> heeft geen effect, waardoor dit simpeler geschreven kan worden als <BM>{expression} = {ans}.</BM></Par>
	return <Par>Zowel de teller als de noemer bevat een factor <M>{sum}.</M> Deze kan dus boven en onder weggelaten worden. Als we de teller door <M>{sum}</M> delen, dan blijft er <M>1</M> over. Zo vinden we <BM>{expression} = {ans}.</BM> Dit kan niet simpeler geschreven worden.</Par>
}

function getFeedback(exerciseData) {
	// Define extra checks.
	const asFraction = (input, correct, { upper, ans }) => upper && onlyOrderChanges(ans.divideBy(Integer.one), input) && <>Je hebt goed de termen weggestreept, maar het resultaat kan nog verder gesimplificeerd worden.</>

	// Determine feedback.
	return getInputFieldFeedback('ans', exerciseData, { feedbackChecks: [originalExpression, asFraction, correctExpression, incorrectExpression] })
}