import React from 'react'

import { expressionComparisons } from 'step-wise/CAS'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import ExpressionInput, { basicMathAndPowers, validWithVariables } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/Status'

import { useSolution } from '../ExerciseContainer'
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
		<Par>Gegeven is de breuk <BM>{expression}.</BM> Voeg boven/onder de breuk zowel een factor <M>{variables.y}</M> als een factor <M>{variables.z}</M> toe.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMathAndPowers} validate={validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const Solution = () => {
	const { expression, factor, ans } = useSolution()
	return <Par>We vermenigvuldigen de noemer boven en onder met de factor <M>{factor}.</M> Als we een breuk boven en onder met hetzelfde vermenigvuldigen blijft de breuk kloppen. Immers, we vermenigvuldigen eerst met <M>{factor}</M> en delen er daarna gelijk weer door. Het resultaat is <BM>{expression} = {ans}.</BM></Par>
}

function getFeedback(exerciseData) {
	// Define extra checks.
	const oneVariableAdded = (input, correct, { variables, expression }) => (onlyOrderChanges(input, expression.multiplyNumDenBy(variables.y)) || onlyOrderChanges(input, expression.multiplyNumDenBy(variables.z))) && <>Goed op weg, maar je hebt slechts één van de twee gevraagde factoren toegevoegd.</>

	// Determine feedback.
	return getInputFieldFeedback('ans', exerciseData, { feedbackChecks: [originalExpression, oneVariableAdded, correctExpression, incorrectExpression] })
}