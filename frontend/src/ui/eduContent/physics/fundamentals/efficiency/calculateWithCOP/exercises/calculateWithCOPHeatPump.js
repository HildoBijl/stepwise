import React from 'react'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { SimpleExercise, getFieldInputFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ Pe, Pin }) {
	return <>
		<Par>We gebruiken een warmtepomp om een gebouw te verwarmen. De warmtepomp gebruikt <M>{Pe}</M> aan elektriciteit en onttrekt hiermee <M>{Pin}</M> warmte aan de buitenlucht. Bereken de warmtefactor (COP) van de warmtepomp.</Par>
		<InputSpace>
			<Par><FloatUnitInput id="COP" prelabel={<M>\varepsilon_w =</M>} label="Warmtefactor" size="s" validate={FloatUnitInput.validation.any} /></Par>
		</InputSpace>
	</>
}

function Solution({ Pe, Pin, Pout, COP }) {
	return <>
		<Par>We berekenen de warmtefactor via <M>\frac(\rm nuttig)(\rm invoer).</M> Het is hierbij belangrijk om te kijken welke energiestroom daadwerkelijk nuttig is. Dit is <em>niet</em> de warmte die uit de buitenlucht onttrokken wordt. Immers, het doel is om het gebouw te verwarmen, en niet om de buitenlucht af te koelen.</Par>
		<Par>We moeten dus eerst berekenen hoeveel energie er in het gebouw terecht komt. Vanwege behoud van energie geldt <BM>P_(binnen) = P_(elek) + P_(buiten) = {Pe} + {Pin} = {Pout}.</BM> Dit is het verwarmingsvermogen. Hiermee kunnen we de warmtefactor vinden via <BM>\varepsilon_w = \frac(\rm nuttig)(\rm invoer) = \frac(P_(binnen))(P_(elek)) = \frac{Pout}{Pe} = {COP}.</BM> Dit betekent dat er <M>{COP}</M> keer meer warmte aan het gebouw afgestaan wordt als dat we aan (elektrische) energie gebruiken.</Par>
	</>
}

function getFeedback(exerciseData) {
	const comparison = exerciseData.metaData.comparison.default
	return getFieldInputFeedback(exerciseData, {
		COP: (input, answer) => answer.subtract(1).equals(input, comparison) && 'Bijna! Kijk nog eens goed naar welke energie we echt als "nuttig" zien.',
	})
}
