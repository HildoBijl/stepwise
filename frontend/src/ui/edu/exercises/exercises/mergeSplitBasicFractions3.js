import React from 'react'

import { expressionChecks } from 'step-wise/CAS'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import ExpressionInput, { basicMath, validWithVariables } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/Status'

import { useCorrect } from '../ExerciseContainer'
import SimpleExercise from '../types/SimpleExercise'

import { getInputFieldFeedback } from '../util/feedback'
import { originalExpression, noSum, sumWithWrongTermsNumber, wrongFirstTerm, wrongSecondTerm, noFraction, hasFractionWithinFraction, correctExpression, incorrectExpression } from '../util/feedbackChecks'

const { equivalent } = expressionChecks

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { toSplit, variables, expression } = useCorrect(state)
	return <>
		{toSplit ? <Par>Gegeven is de breuk <BM>{expression}.</BM> Splits deze breuk op in twee losse breuken.</Par> : <Par>Gegeven is de uitdrukking <BM>{expression}.</BM> Schrijf dit als één breuk.</Par>}
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{expression}=</M>} label="Vul hier het resultaat in" size="l" settings={basicMath} validate={validWithVariables(Object.values(variables))} />
			</Par>
		</InputSpace>
	</>
}

const Solution = (state) => {
	const { toSplit, plus, expression, ans } = useCorrect(state)
	if (toSplit) {
		return <Par>Bij een breuk mag je elke term in de teller ook los door de noemer delen. Een eventueel plus/min teken blijft hierbij behouden. Zo vinden we <BM>{expression} = {ans}.</BM></Par>
	}
	return <Par>Als je twee breuken {plus ? 'bij elkaar optelt' : 'van elkaar afhaalt'}, en die breuken hebben <strong>gelijke noemer</strong>, dan mag je deze breuken samenvoegen. Je {plus ? 'telt dan de tellers los bij elkaar op' : 'haalt dan de tellers los van elkaar af'} en deelt dit geheel door de noemer. Het resultaat van deze regel is <BM>{expression} = {ans}.</BM></Par>
}

function getFeedback(exerciseData) {
	const { state: { toSplit } } = exerciseData

	// Define extra checks.
	const wrongDenominator = {
		check: (correct, input) => !equivalent(correct.denominator, input.denominator),
		text: <>Bij het samenvoegen van breuken hoort de noemer hetzelfde te blijven. Dat is bij jouw antwoord niet zo.</>,
	}
	const wrongNumerator = {
		check: (correct, input) => !equivalent(correct.numerator, input.numerator),
		text: <>De noemer klopt, maar er gaat iets mis in de teller van je breuk.</>,
	}

	// Determine the checks, based on the exercise type.
	const feedbackChecks = toSplit ? [
		originalExpression,
		noSum,
		sumWithWrongTermsNumber,
		wrongFirstTerm,
		wrongSecondTerm,
		correctExpression,
		incorrectExpression,
	] : [
		originalExpression,
		noFraction,
		wrongDenominator,
		wrongNumerator,
		hasFractionWithinFraction,
		correctExpression,
		incorrectExpression,
	]

	// Determine feedback.
	return getInputFieldFeedback('ans', exerciseData, { feedbackChecks })
}