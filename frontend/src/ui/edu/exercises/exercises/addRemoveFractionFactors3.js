import React from 'react'

import { checks } from 'step-wise/inputTypes/Expression'
import Fraction from 'step-wise/inputTypes/Expression/functions/Fraction'
import Integer from 'step-wise/inputTypes/Expression/Integer'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import ExpressionInput, { basicMath, validWithVariables } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/Status'

import { useCorrect } from '../ExerciseContainer'
import SimpleExercise from '../types/SimpleExercise'

import { getInputFieldFeedback } from '../util/feedback'
import { originalExpression, correctExpression, incorrectExpression } from '../util/feedbackChecks'

const { onlyOrderChanges } = checks

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { variables, expression } = useCorrect(state)
	return <>
		<Par>Gegeven is de breuk <BM>{expression}.</BM> Streep gemeenschappelijke factoren in de teller/noemer weg. Simplificeer het resultaat zo veel mogelijk.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMath} validate={validWithVariables(Object.values(variables))} />
			</Par>
		</InputSpace>
	</>
}

const Solution = (state) => {
	const { upper, sum, expression, ans } = useCorrect(state)
	if (upper)
		return <Par>Zowel de teller als de noemer bevat een factor <M>{sum}.</M> Deze kan dus boven en onder weggelaten worden. Als we de noemer door <M>{sum}</M> delen, dan blijft er <M>1</M> over. Zo vinden we <BM>{expression} = \frac({ans})(1).</BM> Delen door <M>1</M> heeft geen effect, waardoor dit simpeler geschreven kan worden als <BM>{expression} = {ans}.</BM></Par>
	return <Par>Zowel de teller als de noemer bevat een factor <M>{sum}.</M> Deze kan dus boven en onder weggelaten worden. Als we de teller door <M>{sum}</M> delen, dan blijft er <M>1</M> over. Zo vinden we <BM>{expression} = {ans}.</BM> Dit kan niet simpeler geschreven worden.</Par>
}

function getFeedback(exerciseData) {
	// Define extra checks.
	const asFraction = {
		check: (correct, input, { upper, ans }) => upper && onlyOrderChanges(new Fraction(ans, Integer.one), input),
		text: <>Je hebt goed de termen weggestreept, maar het resultaat kan nog verder gesimplificeerd worden.</>,
	}

	// Determine feedback.
	return getInputFieldFeedback('ans', exerciseData, { feedbackChecks: [originalExpression, asFraction, correctExpression, incorrectExpression], solved: exerciseData.progress.solved })
}