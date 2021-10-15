import React from 'react'

import Fraction from 'step-wise/inputTypes/Expression/functions/Fraction'
import Integer from 'step-wise/inputTypes/Expression/Integer'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import ExpressionInput, { basicMath, validWithVariables } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/Status'

import { useCorrect } from '../ExerciseContainer'
import SimpleExercise from '../types/SimpleExercise'

import { getInputFieldFeedback } from '../util/feedback'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { variables, expression } = useCorrect(state)

	return <>
		<Par>Gegeven is de breuk <BM>{expression}.</BM> Streep gemeenschappelijke factoren in de teller/noemer weg. Simplificeer het resultaat zo veel mogelijk.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={{ ...basicMath, greek: false }} validate={validWithVariables(Object.values(variables))} />
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
	const equalityOptions = exerciseData.shared.data.equalityOptions.default
	const originalExpression = {
		check: (input, { expression }) => expression.equals(input, equalityOptions),
		text: <>Dit is de oorspronkelijke uitdrukking. Je hebt nog geen termen weggestreept.</>,
	}
	const asFraction = {
		check: (input, { upper, ans }) => upper && (new Fraction(ans, Integer.one)).equals(input, equalityOptions),
		text: <>Je hebt goed de termen weggestreept, maar het resultaat kan nog verder gesimplificeerd worden.</>,
	}
	const correctExpression = {
		check: (input, { ans }) => ans.equals(input),
		text: <>De uitdrukking klopt wel, maar je moet hem nog verder simplificeren.</>,
	}
	const remaining = {
		check: () => true,
		text: <>Deze uitdrukking is niet gelijk aan wat gegeven is. Je hebt bij het omschrijven iets gedaan dat niet mag.</>,
	}

	// Determine feedback.
	return getInputFieldFeedback('ans', exerciseData, { checks: [originalExpression, asFraction, correctExpression, remaining] })
}