import React from 'react'

import { expressionComparisons } from 'step-wise/CAS'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import ExpressionInput, { basicMathAndPowers, validWithVariables } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/FormPart'

import { useSolution } from '../util/SolutionProvider'
import SimpleExercise from '../types/SimpleExercise'

import { getInputFieldFeedback } from '../util/feedback'
import { originalExpression, correctExpression, incorrectExpression } from '../util/feedbackChecks/expression'

const { onlyOrderChanges } = expressionComparisons

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, expression } = useSolution()
	return <>
		<Par>Gegeven is de breuk <BM>{expression}.</BM> Simplificeer deze breuk zo veel mogelijk door gemeenschappelijke factoren in de teller/noemer weg te strepen.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={{ ...basicMathAndPowers, power: true }} validate={validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const Solution = () => {
	const { variables, expression, ans } = useSolution()
	return <Par>Zowel de teller als de noemer bevat een factor <M>{variables.y}.</M> Deze kan dus boven en onder weggelaten worden. Hetzelfde geldt voor de factor <M>{variables.z}</M>: die kan ook weggestreept worden. Er geldt dus <BM>{expression} = {ans}.</BM></Par>
}

function getFeedback(exerciseData) {
	// Define extra checks.
	const oneVariableCancelled = (input, correct, { variables, ans }) => (onlyOrderChanges(input, ans.multiplyNumDen(variables.y)) || onlyOrderChanges(input, ans.multiplyNumDen(variables.z))) && <>Goed op weg, maar er is nòg een variabele die je weg kunt strepen.</>

	// Determine feedback.
	return getInputFieldFeedback('ans', exerciseData, { feedbackChecks: [originalExpression, oneVariableCancelled, correctExpression, incorrectExpression] })
}