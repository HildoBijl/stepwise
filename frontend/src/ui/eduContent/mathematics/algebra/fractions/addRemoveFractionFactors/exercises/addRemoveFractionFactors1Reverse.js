import React from 'react'

import { expressionComparisons } from 'step-wise/CAS'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { useSolution, SimpleExercise, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

const { onlyOrderChanges } = expressionComparisons
const { originalExpression, correctExpression, incorrectExpression } = expressionChecks

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, expression } = useSolution()
	return <>
		<Par>Gegeven is de breuk <BM>{expression}.</BM> Voeg boven/onder de breuk zowel een factor <M>{variables.y}</M> als een factor <M>{variables.z}</M> toe.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.basicMath} validate={ExpressionInput.validation.validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const Solution = ({ expression, factor, ans }) => {
	return <Par>We vermenigvuldigen de noemer boven en onder met de factor <M>{factor}.</M> Als we een breuk boven en onder met hetzelfde vermenigvuldigen blijft de breuk kloppen. Immers, we vermenigvuldigen eerst met <M>{factor}</M> en delen er daarna gelijk weer door. Het resultaat is <BM>{expression} = {ans}.</BM></Par>
}

function getFeedback(exerciseData) {
	// Define extra checks.
	const oneVariableAdded = (input, correct, { variables, expression }) => (onlyOrderChanges(input, expression.multiplyNumDen(variables.y)) || onlyOrderChanges(input, expression.multiplyNumDen(variables.z))) && <>Goed op weg, maar je hebt slechts één van de twee gevraagde factoren toegevoegd.</>

	// Determine feedback.
	return getFieldInputFeedback(exerciseData, { ans: [originalExpression, oneVariableAdded, correctExpression, incorrectExpression] })
}
