import React from 'react'

import { Fraction, expressionComparisons } from 'step-wise/CAS'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { useSolution, SimpleExercise, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

const { onlyOrderChanges } = expressionComparisons
const { noFraction, incorrectExpression } = expressionChecks

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

const Problem = () => {
	const { upper, variables, expression, sum } = useSolution()
	return <>
		<Par>Gegeven is de {upper ? 'term' : 'breuk'} <BM>{expression}.</BM> Herschrijf deze term tot een enkele breuk met {upper ? 'noemer' : 'teller'} gelijk aan <M>{sum}</M>.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.basicMath} validate={ExpressionInput.validation.validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const Solution = ({ upper, sum, expression, ans }) => {
	if (upper)
		return <Par>We vermenigvuldigen en delen de factor <M>{expression}</M> met <M>{sum}</M>. Immers, als we <M>{expression}</M> met iets vermenigvuldigen en vervolgens er weer door delen, dan houdt de uitdrukking dezelfde waarde. Als we de haakjes bij de vermenigvuldiging (zeer cruciaal) niet vergeten, dan krijgen we <BM>{expression} = {ans}.</BM></Par>
	return <Par>We vermenigvuldigen zowel de teller als de noemer van de breuk <M>{expression}</M> met <M>{sum}</M>. Immers, als we zowel met <M>{expression}</M> vermenigvuldigen als erdoor delen, dan heeft het geen invloed op de waarde van onze breuk. Als we ook nog de haakjes in de noemer (zeer cruciaal) niet vergeten, dan krijgen we <BM>{expression} = {ans}.</BM></Par>
}

function getFeedback(exerciseData) {
	// Define extra checks.
	const originalExpression = (input, correct, { expression, upper }) => onlyOrderChanges(expression, input) && <>Dit is de oorspronkelijke uitdrukking. Je hebt er nog geen breuk van gemaakt met de gevraagde {upper ? 'noemer' : 'teller'}.</>

	const wrongPart = (input, correct, { upper, sum }) => input.isSubtype(Fraction) && !onlyOrderChanges(sum, input[upper ? 'denominator' : 'numerator']) && <>Je antwoord heeft niet <M>{sum}</M> in de {upper ? 'noemer' : 'teller'}.</>

	// Determine feedback.
	return getFieldInputFeedback(exerciseData, { ans: [originalExpression, noFraction, wrongPart, incorrectExpression] })
}
