import React from 'react'

import { expressionChecks } from 'step-wise/CAS'

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
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMath} validate={validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const Solution = (state) => {
	const { variables, expression, ans } = useSolution(state)
	return <Par>Zowel de teller als de noemer bevat een factor <M>{variables.x}.</M> Deze kan dus boven en onder weggelaten worden. Hetzelfde geldt voor de factor <M>{variables.y}</M>: die kan ook weggestreept worden. Er geldt dus <BM>{expression} = {ans}.</BM></Par>
}

function getFeedback(exerciseData) {
	// Define extra checks.
	const oneVariableCancelled = {
		check: (correct, input, { variables, ans }) => onlyOrderChanges(ans.multiplyNumDenBy(variables.x), input) || onlyOrderChanges(ans.multiplyNumDenBy(variables.y), input),
		text: <>Goed op weg, maar er is nòg een variabele die je weg kunt strepen.</>,
	}

	// Determine feedback.
	return getInputFieldFeedback('ans', exerciseData, { feedbackChecks: [originalExpression, oneVariableCancelled, correctExpression, incorrectExpression] })
}