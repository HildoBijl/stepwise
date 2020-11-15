import React from 'react'

import { M, BM } from 'util/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput, { validNumberAndUnit } from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'

import SimpleExercise from '../types/SimpleExercise'
import { useExerciseData } from '../ExerciseContainer'
import { getDefaultFeedback } from '../util/feedback'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ Ee, Eout }) {
	return <>
		<Par>Gedurende een volle dag wordt het energieverbruik van een koelkast gemeten. In deze dag heeft de koelkast <M>{Ee}</M> aan elektriciteit verbruikt. Ook is er <M>{Eout}</M> warmte aan de keuken afgestaan. Bereken de koudefactor van de koelkast.</Par>
		<InputSpace>
			<Par><FloatUnitInput id="epsilon" prelabel={<M>\epsilon =</M>} label="Koudefactor" size="s" validate={validNumberAndUnit} /></Par>
		</InputSpace>
	</>
}

function Solution({ Ee, Eout }) {
	const { shared: { getCorrect } } = useExerciseData()
	const Ef = Eout.subtract(Ee, true)
	const epsilon = getCorrect({ Ee, Eout })

	return <>
		<Par>We berekenen de koudefactor via <M>\frac(\rm nuttig)(\rm invoer).</M> Het is hierbij belangrijk om te kijken welke energiestroom daadwerkelijk nuttig is. Dit is <em>niet</em> de warmte die aan de keuken toegevoerd wordt. Immers, het doel is om de koelkast koud te krijgen, en niet om de keuken warm te krijgen.</Par>
		<Par>We moeten dus eerst berekenen hoeveel energie uit de koelkast is gehaald. Vanwege behoud van energie geldt <BM>E_(elek) + E_(koel) = E_(keuken).</BM> De koelenergie <M>E_(koel)</M> is hiermee gelijk aan <BM>E_(koel) = E_(keuken) - E_(elek) = {Eout} - {Ee} = {Ef}.</BM> Hiermee kunnen we de koudefactor vinden via <BM>\epsilon = \frac(\rm nuttig)(\rm invoer) = \frac(E_(koel))(E_(elek)) = \frac{Ef}{Ee} = {epsilon}.</BM> Dit betekent dat er <M>{epsilon}</M> keer meer warmte aan de koelkast wordt onttrokken als dat we aan (elektrische) energie gebruiken.</Par>
	</>
}

function getFeedback(exerciseData) {
	// Check for a common error.
	const { input: { epsilon }, state, shared: { getCorrect, data: { equalityOptions } } } = exerciseData
	const correct = getCorrect(state)
	if (correct.add(1).equals(epsilon, equalityOptions))
		return { epsilon: { correct: false, text: 'Bijna! Kijk nog eens goed naar welke energie we echt als "nuttig" zien.' } }

	// Give default feedback.
	return getDefaultFeedback('epsilon', exerciseData)
}