import React from 'react'

import { expressionComparisons } from 'step-wise/CAS'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { SimpleExercise, useSolution, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

const { onlyOrderChanges } = expressionComparisons
const { originalExpression, correctExpression, incorrectExpression } = expressionChecks

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, expression } = useSolution()
	return <>
		<Par>Gegeven is de breuk <BM>{expression}.</BM> Simplificeer deze breuk zo veel mogelijk door gemeenschappelijke factoren in de teller/noemer weg te strepen.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.basicMath} validate={ExpressionInput.validation.validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const Solution = ({ variables, expression, ans }) => {
	return <Par>Zowel de teller als de noemer bevat een factor <M>{variables.y}.</M> Deze kan dus boven en onder weggelaten worden. Hetzelfde geldt voor de factor <M>{variables.z}</M>: die kan ook weggestreept worden. Er geldt dus <BM>{expression} = {ans}.</BM></Par>
}

function getFeedback(exerciseData) {
	// Define extra checks.
	const oneVariableCancelled = (input, correct, { variables, ans }) => (onlyOrderChanges(input, ans.multiplyNumDen(variables.y)) || onlyOrderChanges(input, ans.multiplyNumDen(variables.z))) && <>Goed op weg, maar er is nòg een variabele die je weg kunt strepen.</>

	// Determine feedback.
	return getFieldInputFeedback(exerciseData, { ans: [originalExpression, oneVariableCancelled, correctExpression, incorrectExpression] })
}
