import React from 'react'

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
	const { expand, expression, terms } = useCorrect(state)

	return <>
		<Par>Gegeven is de uitdrukking <BM>{expression}.</BM> {expand ? <>Werk de haakjes uit en schrijf het resultaat zo simpel mogelijk op.</> : <>Breng de term <M>{terms[0]}</M> buiten haakjes.</>}</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={{ ...basicMath, divide: false, greek: false }} validate={validWithVariables('x', 'y', 'z')} />
			</Par>
		</InputSpace>
	</>
}

const Solution = (state) => {
	const { expand, terms, ans } = useCorrect(state)

	if (expand)
		return <Par>Om de haakjes uit te werken vermenigvuldigen we de term buiten haakjes <M>{terms[0]}</M> los met elk van de termen binnen haakjes <M>{terms[1]}</M> en <M>{terms[2]}</M>. Zo vinden we eerst <BM>\left({terms[0]}\right)\cdot\left({terms[1]}\right)+\left({terms[0]}\right)\cdot\left({terms[2]}\right).</BM> Als we dit verder uitwerken, dan kunnen we dit simplificeren tot <BM>{ans}.</BM></Par>

	return <Par>Als we de term <M>{terms[0]}</M> buiten haakjes halen, dan willen we het bovenstaande schrijven als <BM>{terms[0]}\left(\ldots + \ldots\right).</BM> Als we hier vervolgens weer de haakjes uitwerken, dan moeten we op de oorspronkelijke uitdrukking uitkomen. Met deze gedachte kunnen we vinden wat op de puntjes moet staan. Het resultaat is <BM>{ans}.</BM></Par>
}

function getFeedback(exerciseData) {
	// Define extra checks.
	const equalityOptions = exerciseData.shared.data.equalityOptions.default
	const originalExpression = {
		check: (input, { expression }) => expression.equals(input, equalityOptions),
		text: <>Dit is de oorspronkelijke uitdrukking. Je hebt de haakjes nog niet uitgewerkt.</>,
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
	return getInputFieldFeedback('ans', exerciseData, { checks: [originalExpression, correctExpression, remaining] })
}