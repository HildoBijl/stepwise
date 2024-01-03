import React from 'react'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { SimpleExercise, getFieldInputFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ Ee, Eout }) {
	return <>
		<Par>Gedurende een volle dag wordt het energieverbruik van een koelkast gemeten. In deze dag heeft de koelkast <M>{Ee}</M> aan elektriciteit verbruikt. Ook is er <M>{Eout}</M> warmte aan de keuken afgestaan. Bereken de koudefactor van de koelkast.</Par>
		<InputSpace>
			<Par><FloatUnitInput id="epsilon" prelabel={<M>\varepsilon =</M>} label="Koudefactor" size="s" validate={FloatUnitInput.validation.any} /></Par>
		</InputSpace>
	</>
}

function Solution({ Ee, Eout, Ef, epsilon }) {
	return <>
		<Par>We berekenen de koudefactor via <M>\frac(\rm nuttig)(\rm invoer).</M> Het is hierbij belangrijk om te kijken welke energiestroom daadwerkelijk nuttig is. Dit is <em>niet</em> de warmte die aan de keuken toegevoerd wordt. Immers, het doel is om de koelkast koud te krijgen, en niet om de keuken warm te krijgen.</Par>
		<Par>We moeten dus eerst berekenen hoeveel energie uit de koelkast is gehaald. Vanwege behoud van energie geldt <BM>E_(elek) + E_(koel) = E_(keuken).</BM> De koelenergie <M>E_(koel)</M> is hiermee gelijk aan <BM>E_(koel) = E_(keuken) - E_(elek) = {Eout} - {Ee} = {Ef}.</BM> Hiermee kunnen we de koudefactor vinden via <BM>\varepsilon = \frac(\rm nuttig)(\rm invoer) = \frac(E_(koel))(E_(elek)) = \frac{Ef}{Ee} = {epsilon}.</BM> Dit betekent dat er <M>{epsilon}</M> keer meer warmte aan de koelkast wordt onttrokken als dat we aan (elektrische) energie gebruiken.</Par>
	</>
}

function getFeedback(exerciseData) {
	const comparison = exerciseData.metaData.comparison.default
	return getFieldInputFeedback(exerciseData, {
		epsilon: (input, answer) => answer.add(1).equals(input, comparison) && 'Bijna! Kijk nog eens goed naar welke energie we echt als "nuttig" zien.',
	})
}
