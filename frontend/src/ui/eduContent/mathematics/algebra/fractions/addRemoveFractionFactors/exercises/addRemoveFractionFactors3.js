import React from 'react'

import { Integer, expressionComparisons } from 'step-wise/CAS'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { useSolution, SimpleExercise, getFieldInputFeedback, expressionChecks } from 'ui/eduTools'

const { onlyOrderChanges } = expressionComparisons
const { originalExpression, equivalentExpression, nonEquivalentExpression } = expressionChecks

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, expression } = useSolution()
	return <>
		<Par>Gegeven is de breuk <BM>{expression}.</BM> Streep gemeenschappelijke factoren in de teller/noemer weg. Simplificeer het resultaat zo veel mogelijk.</Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={ExpressionInput.settings.withFractions} validate={ExpressionInput.validation.validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const Solution = ({ upper, sum, expression, ans }) => {
	if (upper)
		return <Par>Zowel de teller als de noemer bevat een factor <M>{sum}.</M> Deze kan dus boven en onder weggelaten worden. Als we de noemer door <M>{sum}</M> delen, dan blijft er <M>1</M> over. Zo vinden we <BM>{expression} = \frac({ans})(1).</BM> Delen door <M>1</M> heeft geen effect, waardoor dit simpeler geschreven kan worden als <BM>{expression} = {ans}.</BM></Par>
	return <Par>Zowel de teller als de noemer bevat een factor <M>{sum}.</M> Deze kan dus boven en onder weggelaten worden. Als we de teller door <M>{sum}</M> delen, dan blijft er <M>1</M> over. Zo vinden we <BM>{expression} = {ans}.</BM> Dit kan niet simpeler geschreven worden.</Par>
}

function getFeedback(exerciseData) {
	// Define extra checks.
	const asFraction = (input, correct, { upper, ans }) => upper && onlyOrderChanges(ans.divide(Integer.one), input) && <>Je hebt goed de termen weggestreept, maar het resultaat kan nog verder gesimplificeerd worden.</>

	// Determine feedback.
	return getFieldInputFeedback(exerciseData, { ans: [originalExpression, asFraction, equivalentExpression, nonEquivalentExpression] })
}
