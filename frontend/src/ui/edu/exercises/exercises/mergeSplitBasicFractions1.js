import React from 'react'

import Expression from 'step-wise/inputTypes/Expression'
import Sum from 'step-wise/inputTypes/Expression/Sum'
import Fraction from 'step-wise/inputTypes/Expression/functions/Fraction'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import ExpressionInput, { basicMath, validWithVariables } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/Status'

import { useCorrect } from '../ExerciseContainer'
import SimpleExercise from '../types/SimpleExercise'

import { getInputFieldFeedback } from '../util/feedback'

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

	// Define checks that hold for all exercise types.
	const originalExpression = {
		check: (input, { expression }) => expression.equals(input, Expression.equalityLevels.onlyOrderChanges),
		text: <>Dit is de oorspronkelijke uitdrukking. {toSplit ? 'Je hebt de breuk nog niet opgesplitst.' : 'Je hebt de uitdrukking nog niet tot een breuk samengevoegd.'}</>,
	}
	const correctExpression = {
		check: (input, { ans }) => ans.equals(input),
		text: <>De uitdrukking klopt wel, maar je hebt niet gedaan wat gevraagd werd.</>,
	}
	const remaining = {
		check: () => true,
		text: <>Deze uitdrukking is niet gelijk aan wat gegeven is. Je hebt bij het omschrijven iets gedaan dat niet mag.</>,
	}

	// Determine the checks, based on the exercise type.
	const checks = toSplit ? [
		originalExpression,
		{
			check: (input) => !input.isType(Sum),
			text: <>Je moet de breuk schrijven als optelling/aftrekking van termen. Je antwoord is helaas geen optelling/aftrekking.</>,
		},
		{
			check: (input, { ans }) => ans.terms.length !== input.terms.length,
			text: (input, { ans }) => <>Je optelsom moet bestaan uit {ans.terms.length} termen, met een plus of minteken ertussen. Nu heb je {input.terms.length} termen.</>,
		},
		{
			check: (input, { ans }) => !ans.terms[0].equals(input.terms[0]) && !ans.terms[1].equals(input.terms[0]),
			text: <>Er lijkt iets mis te zijn met de eerste term van je antwoord.</>,
		},
		{
			check: (input, { ans }) => !ans.terms[0].equals(input.terms[1]) && !ans.terms[1].equals(input.terms[1]),
			text: <>Er lijkt iets mis te zijn met de tweede term van je antwoord.</>,
		},
		correctExpression,
		remaining,
	] : [
		originalExpression,
		{
			check: (input) => !input.isType(Fraction),
			text: <>Je moet de breuk schrijven als optelling/aftrekking van termen. Je antwoord is helaas geen optelling/aftrekking.</>,
		},
		{
			check: (input, { ans }) => !ans.denominator.equals(input.denominator, Expression.equalityLevels.onlyOrderChanges),
			text: <>Bij het samenvoegen van breuken blijft de noemer hetzelfde. Dat is bij jou antwoord niet zo.</>,
		},
		{
			check: (input, { ans }) => !ans.numerator.equals(input.numerator, Expression.equalityLevels.onlyOrderChanges),
			text: <>De noemer klopt, maar er gaat iets mis in de teller van je breuk.</>,
		},
		{
			check: (input) => input.numerator.recursiveSome(term => term.isType(Fraction)) || input.denominator.recursiveSome(term => term.isType(Fraction)),
			text: <>Je antwoord mag geen verdere breuken bevatten.</>,
		},
		correctExpression,
		remaining,
	]

	// ToDo consider: setting the set-up equal to the check.
	// - Trigger check on a false result?
	// - Use same formatting for input object?
	// Or do we change the feedback mechanism altogether? Since standard tests don't really seem to apply.
	// How does this work for a step exercise? Try to consider a mergeSplitFractions exercise to see how this goes.

	// Determine feedback.
	return getInputFieldFeedback('ans', exerciseData, { checks, solved: exerciseData.progress.solved })
}