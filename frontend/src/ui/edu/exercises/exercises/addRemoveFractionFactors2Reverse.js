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
	const { variables, expression } = useCorrect(state)

	return <>
		<Par>Gegeven is de breuk <BM>{expression}.</BM> Voeg boven/onder de breuk zowel een factor <M>{variables.x}</M> als een factor <M>{variables.y}</M> toe.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMath} validate={validWithVariables(Object.values(variables))} />
			</Par>
		</InputSpace>
	</>
}

const Solution = (state) => {
	const { expression, factor, ans } = useCorrect(state)

	return <Par>We vermenigvuldigen de noemer boven en onder met de factor <M>{factor}.</M> Als we een breuk boven en onder met hetzelfde vermenigvuldigen blijft de breuk kloppen. Immers, we vermenigvuldigen eerst met <M>{factor}</M> en delen er daarna gelijk weer door. Het resultaat is <BM>{expression} = {ans}.</BM></Par>
}

function getFeedback(exerciseData) {
	// Define extra checks.
	const equalityOptions = exerciseData.shared.data.equalityOptions.default
	const originalExpression = {
		check: (input, { expression }) => expression.equals(input, equalityOptions),
		text: <>Dit is de oorspronkelijke uitdrukking. Je hebt nog geen factoren toegevoegd.</>,
	}
	const oneVariableAdded = {
		check: (input, { variables, expression }) => (expression.multiplyNumDenBy(variables.x).equals(input, equalityOptions) || expression.multiplyNumDenBy(variables.y).equals(input, equalityOptions)),
		text: <>Goed op weg, maar je hebt slechts één van de twee gevraagde factoren toegevoegd.</>,
	}
	const correctExpression = {
		check: (input, { ans }) => ans.equals(input),
		text: <>De uitdrukking klopt wel, maar het is niet wat gevraagd wordt.</>,
	}
	const remaining = {
		check: () => true,
		text: <>Deze uitdrukking is niet gelijk aan wat gegeven is. Je hebt bij het omschrijven iets gedaan dat niet mag.</>,
	}

	// Determine feedback.
	return getInputFieldFeedback('ans', exerciseData, { checks: [originalExpression, oneVariableAdded, correctExpression, remaining] })
}