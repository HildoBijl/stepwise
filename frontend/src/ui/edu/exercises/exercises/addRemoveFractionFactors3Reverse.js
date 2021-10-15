import React from 'react'

import Fraction from 'step-wise/inputTypes/Expression/functions/Fraction'

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
	const { upper, variables, expression, sum } = useCorrect(state)

	return <>
		<Par>Gegeven is de {upper ? 'term' : 'breuk'} <BM>{expression}.</BM> Herschrijf deze term tot een enkele breuk met {upper ? 'noemer' : 'teller'} gelijk aan <M>{sum}</M>.</Par>
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
		return <Par>We vermenigvuldigen en delen de factor <M>{expression}</M> met <M>{sum}</M>. Immers, als we <M>{expression}</M> met iets vermenigvuldigen en vervolgens er weer door delen, dan houdt de uitdrukking dezelfde waarde. Als we de haakjes bij de vermenigvuldiging (zeer cruciaal) niet vergeten, dan krijgen we <BM>{expression} = {ans}.</BM></Par>
	return <Par>We vermenigvuldigen zowel de teller als de noemer van de breuk <M>{expression}</M> met <M>{sum}</M>. Immers, als we zowel met <M>{expression}</M> vermenigvuldigen als erdoor delen, dan heeft het geen invloed op de waarde van onze breuk. Als we ook nog de haakjes in de noemer (zeer cruciaal) niet vergeten, dan krijgen we <BM>{expression} = {ans}.</BM></Par>
}

function getFeedback(exerciseData) {
	// Define extra checks.
	const equalityOptions = exerciseData.shared.data.equalityOptions.default
	const originalExpression = {
		check: (input, { expression }) => expression.equals(input, equalityOptions),
		text: (input, { upper }) => <>Dit is de oorspronkelijke uitdrukking. Je hebt er nog geen breuk van gemaakt met de gevraagde {upper ? 'teller' : 'noemer'}.</>,
	}
	const isFraction = {
		check: (input) => !input.isType(Fraction),
		text: <>Je antwoord is geen breuk, zoals gevraagd.</>
	}
	const hasRightPart = {
		check: (input, { upper, sum }) => input.isType(Fraction) && !sum.equals(input[upper ? 'denominator' : 'numerator'], equalityOptions),
		text: (input, { upper, sum }) => <>Je antwoord heeft niet <M>{sum}</M> in de {upper ? 'noemer' : 'teller'}.</>,
	}
	const remaining = {
		check: () => true,
		text: <>Deze uitdrukking is niet gelijk aan wat gegeven is. Je hebt bij het omschrijven iets gedaan dat niet mag.</>,
	}

	// Determine feedback.
	return getInputFieldFeedback('ans', exerciseData, { checks: [originalExpression, isFraction, hasRightPart, remaining] })
}