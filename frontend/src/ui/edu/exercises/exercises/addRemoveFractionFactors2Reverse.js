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
	const { variables, expression } = useCorrect(state)

	return <>
		<Par>Gegeven is de breuk <BM>{expression}.</BM> Vermenigvuldig zowel de noemer als de teller met een factor <M>{variables.x}.</M> Schrijf het resultaat zo simpel mogelijk op.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={{ ...basicMath, power: true }} validate={validWithVariables(Object.values(variables))} />
			</Par>
		</InputSpace>
	</>
}

const Solution = (state) => {
	const { variables, square, expression, ans } = useCorrect(state)

	return <Par>We vermenigvuldigen de gegeven breuk boven en onder met de factor <M>{variables.x}.</M> Bovenin de breuk staat al een factor <M>{variables.x}</M>, dus we kunnen daar <M>{variables.x} \cdot {variables.x}</M> simpeler schrijven als <M>{square}.</M> Onderin komt er simpelweg een factor <M>{variables.x}</M> bij. Zo krijgen we <BM>{expression} = {ans}.</BM></Par>
}

function getFeedback(exerciseData) {
	// Define extra checks.
	const equalityOptions = exerciseData.shared.data.equalityOptions.default
	const originalExpression = {
		check: (input, { expression }) => expression.equals(input, equalityOptions),
		text: (input, { variables }) => <>Dit is de oorspronkelijke uitdrukking. Je hebt boven en onder nog niet met <M>{variables.x}</M> vermenigvuldigd.</>,
	}
	const noFraction = {
		check: (input) => !input.isType(Fraction),
		text: <>Je resultaat is geen breuk meer. Je moet een breuk als antwoord geven.</>,
	}
	const wrongDenominator = {
		check: (input, { ans }) => !ans.denominator.equals(input.denominator, equalityOptions),
		text: (input, { variables }) => <>Er is iets mis met je noemer. Hier is geen factor <M>{variables.x}</M> bijgekomen zoals beoogd.</>,
	}
	const noSquare = {
		check: (input, { expression, variables }) => expression.numerator.multiplyBy(variables.x).equals(input.numerator, equalityOptions),
		text: (input, { variables }) => <>Je kan je antwoord nog simpeler schrijven. Tip: Wat is <M>{variables.x} \cdot {variables.x}</M>?</>
	}
	const wrongNumerator = {
		check: (input, { ans }) => !ans.numerator.equals(input.numerator, equalityOptions),
		text: (input, { variables }) => <>Er is iets mis met je teller. Hier is geen factor <M>{variables.x}</M> bijgekomen zoals beoogd.</>,
	}
	const remaining = {
		check: () => true,
		text: <>Deze uitdrukking is niet gelijk aan wat gegeven is. Je hebt bij het omschrijven iets gedaan dat niet mag.</>,
	}

	// Determine feedback.
	return getInputFieldFeedback('ans', exerciseData, { checks: [originalExpression, noFraction, wrongDenominator, noSquare, wrongNumerator, remaining], solved: exerciseData.progress.solved })
}