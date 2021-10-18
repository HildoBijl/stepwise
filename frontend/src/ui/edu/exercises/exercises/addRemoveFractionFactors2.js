import React from 'react'

import Expression from 'step-wise/inputTypes/Expression'

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
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={{ ...basicMath, power: true }} validate={validWithVariables(Object.values(variables))} />
			</Par>
		</InputSpace>
	</>
}

const Solution = (state) => {
	const { variables, square, expression, ans } = useCorrect(state)

	return <Par>Zowel de teller als de noemer bevatten een factor <M>{variables.x}.</M> De teller bevat er zelfs twee: onthoud dat <M>{square} = {variables.x} \cdot {variables.x}.</M> Als we de factor <M>{variables.x}</M> onderin wegstrepen tegen één van de factoren <M>{variables.x}</M> bovenin, dan blijven we over met <BM>{expression} = {ans}.</BM></Par>
}

function getFeedback(exerciseData) {
	// Define extra checks.
	const equalityOptions = exerciseData.shared.data.equalityOptions.default
	const originalExpression = {
		check: (input, { expression }) => expression.equals(input, equalityOptions),
		text: <>Dit is de oorspronkelijke uitdrukking. Je hebt nog geen termen weggestreept.</>,
	}
	const squareDisappeared = {
		check: (input, { variables, ans }) => ans.divideBy(variables.x).simplify(Expression.simplifyOptions.basicClean).equals(input, equalityOptions),
		text: (input, { square, variables }) => <>Je hebt <M>{square}</M> in z'n geheel weggestreept tegen <M>{variables.x}.</M> Dat mag niet! Onthoud dat <M>{square} = {variables.x} \cdot {variables.x}.</M></>,
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
	return getInputFieldFeedback('ans', exerciseData, { checks: [originalExpression, squareDisappeared, correctExpression, remaining], solved: exerciseData.progress.solved })
}