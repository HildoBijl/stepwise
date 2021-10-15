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
		<Par>Gegeven is de breuk <BM>{expression}.</BM> Simplificeer deze breuk zo veel mogelijk door gemeenschappelijke factoren in de teller/noemer weg te strepen.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMath} validate={validWithVariables(Object.values(variables))} />
			</Par>
		</InputSpace>
	</>
}

const Solution = (state) => {
	const { variables, expression, ans } = useCorrect(state)

	return <Par>Zowel de teller als de noemer bevat een factor <M>{variables.x}.</M> Deze kan dus boven en onder weggelaten worden. Hetzelfde geldt voor de factor <M>{variables.y}</M>: die kan ook weggestreept worden. Er geldt dus <BM>{expression} = {ans}.</BM></Par>
}

function getFeedback(exerciseData) {
	// Define extra checks.
	const equalityOptions = exerciseData.shared.data.equalityOptions.default
	const originalExpression = {
		check: (input, { expression }) => expression.equals(input, equalityOptions),
		text: <>Dit is de oorspronkelijke uitdrukking. Je hebt nog geen termen weggestreept.</>,
	}
	const oneVariableCancelled = {
		check: (input, { variables, ans }) => (ans.multiplyNumDenBy(variables.x).equals(input, equalityOptions) || ans.multiplyNumDenBy(variables.y).equals(input, equalityOptions)),
		text: <>Goed op weg, maar er is nòg een variabele die je weg kunt strepen.</>,
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
	return getInputFieldFeedback('ans', exerciseData, { checks: [originalExpression, oneVariableCancelled, correctExpression, remaining] })
}