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
		<Par>Gegeven is de breuk <BM>{expression}.</BM> Simplificeer deze breuk zo veel mogelijk door gemeenschappelijke factoren in de teller/noemer weg te strepen.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={{ ...ExpressionInput.settings.basicMath, power: true }} validate={ExpressionInput.validation.validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const Solution = ({ variables, square, expression, ans }) => {
	return <Par>Zowel de teller als de noemer bevatten een factor <M>{variables.x}.</M> De teller bevat er zelfs twee: onthoud dat <M>{square} = {variables.x} \cdot {variables.x}.</M> Als we de factor <M>{variables.x}</M> onderin wegstrepen tegen één van de factoren <M>{variables.x}</M> bovenin, dan blijven we over met <BM>{expression} = {ans}.</BM></Par>
}

function getFeedback(exerciseData) {
	// Define extra checks.
	const squareDisappeared = (input, correct, { square, variables, ans }) => onlyOrderChanges(input, ans.divide(variables.x).regularClean()) && <>Je hebt <M>{square}</M> in z'n geheel weggestreept tegen <M>{variables.x}.</M> Dat mag niet! Onthoud dat <M>{square} = {variables.x} \cdot {variables.x}.</M></>

	// Determine feedback.
	return getFieldInputFeedback(exerciseData, { ans: [originalExpression, squareDisappeared, correctExpression, incorrectExpression] })
}
