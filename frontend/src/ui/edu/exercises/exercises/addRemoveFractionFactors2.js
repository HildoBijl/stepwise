import React from 'react'

import { simplifyOptions, expressionChecks } from 'step-wise/CAS'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import ExpressionInput, { basicMath, validWithVariables } from 'ui/form/inputs/ExpressionInput'
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
		<Par>Gegeven is de breuk <BM>{expression}.</BM> Simplificeer deze breuk zo veel mogelijk door gemeenschappelijke factoren in de teller/noemer weg te strepen.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={{ ...basicMath, power: true }} validate={validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const Solution = (state) => {
	const { variables, square, expression, ans } = useSolution(state)
	return <Par>Zowel de teller als de noemer bevatten een factor <M>{variables.x}.</M> De teller bevat er zelfs twee: onthoud dat <M>{square} = {variables.x} \cdot {variables.x}.</M> Als we de factor <M>{variables.x}</M> onderin wegstrepen tegen één van de factoren <M>{variables.x}</M> bovenin, dan blijven we over met <BM>{expression} = {ans}.</BM></Par>
}

function getFeedback(exerciseData) {
	// Define extra checks.
	const squareDisappeared = {
		check: (correct, input, { variables, ans }) => onlyOrderChanges(ans.divideBy(variables.x).simplify(simplifyOptions.basicClean), input),
		text: (correct, input, { square, variables }) => <>Je hebt <M>{square}</M> in z'n geheel weggestreept tegen <M>{variables.x}.</M> Dat mag niet! Onthoud dat <M>{square} = {variables.x} \cdot {variables.x}.</M></>,
	}

	// Determine feedback.
	return getInputFieldFeedback('ans', exerciseData, { feedbackChecks: [originalExpression, squareDisappeared, correctExpression, incorrectExpression] })
}