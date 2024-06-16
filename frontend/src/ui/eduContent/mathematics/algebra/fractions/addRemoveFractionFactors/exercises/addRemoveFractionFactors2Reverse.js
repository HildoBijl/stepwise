import React from 'react'

import { expressionComparisons } from 'step-wise/CAS'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { useSolution, SimpleExercise, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

const { onlyOrderChanges } = expressionComparisons
const { originalExpression, noFraction, incorrectExpression } = expressionChecks

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, expression } = useSolution()
	return <>
		<Par>Gegeven is de breuk <BM>{expression}.</BM> Vermenigvuldig zowel de noemer als de teller met een factor <M>{variables.x}.</M> Schrijf de teller en noemer zo simpel mogelijk op.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={{ ...ExpressionInput.settings.withFractions, power: true }} validate={ExpressionInput.validation.validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const Solution = ({ variables, square, expression, ans }) => {
	return <Par>We vermenigvuldigen de gegeven breuk boven en onder met de factor <M>{variables.x}.</M> Bovenin de breuk staat al een factor <M>{variables.x}</M>, dus we kunnen daar <M>{variables.x} \cdot {variables.x}</M> simpeler schrijven als <M>{square}.</M> Onderin komt er simpelweg een factor <M>{variables.x}</M> bij. Zo krijgen we <BM>{expression} = {ans}.</BM></Par>
}

function getFeedback(exerciseData) {
	// Define extra checks.
	const wrongDenominator = (input, correct, { variables, ans }) => !onlyOrderChanges(ans.denominator, input.denominator) && <>Er is iets mis met je noemer. Hier is geen factor <M>{variables.x}</M> bijgekomen zoals beoogd.</>

	const noSquare = (input, correct, { expression, variables }) => onlyOrderChanges(expression.numerator.multiply(variables.x), input.numerator) && <>Je kan je antwoord nog simpeler schrijven. Tip: Wat is <M>{variables.x} \cdot {variables.x}</M>?</>

	const wrongNumerator = (input, correct, { variables, ans }) => !onlyOrderChanges(ans.numerator, input.numerator) && <>Er is iets mis met je teller. Hier is geen factor <M>{variables.x}</M> bijgekomen zoals beoogd.</>

	// Determine feedback.
	return getFieldInputFeedback(exerciseData, { ans: [originalExpression, noFraction, wrongDenominator, noSquare, wrongNumerator, incorrectExpression] })
}
