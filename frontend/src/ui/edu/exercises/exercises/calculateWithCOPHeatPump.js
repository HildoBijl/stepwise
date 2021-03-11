import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput, { validNumberAndUnit } from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'

import SimpleExercise from '../types/SimpleExercise'
import { useCorrect } from '../ExerciseContainer'
import { getInputFieldFeedback } from '../util/feedback'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ Pe, Pin }) {
	return <>
		<Par>We gebruiken een warmtepomp om een gebouw te verwarmen. De warmtepomp gebruikt <M>{Pe}</M> aan elektriciteit en onttrekt hiermee <M>{Pin}</M> warmte aan de buitenlucht. Bereken de warmtefactor (COP) van de warmtepomp.</Par>
		<InputSpace>
			<Par><FloatUnitInput id="COP" prelabel={<M>\epsilon_w =</M>} label="Warmtefactor" size="s" validate={validNumberAndUnit} /></Par>
		</InputSpace>
	</>
}

function Solution({ Pe, Pin }) {
	const Pout = Pin.add(Pe, true)
	const COP = useCorrect()
	return <>
		<Par>We berekenen de warmtefactor via <M>\frac(\rm nuttig)(\rm invoer).</M> Het is hierbij belangrijk om te kijken welke energiestroom daadwerkelijk nuttig is. Dit is <em>niet</em> de warmte die uit de buitenlucht onttrokken wordt. Immers, het doel is om het gebouw te verwarmen, en niet om de buitenlucht af te koelen.</Par>
		<Par>We moeten dus eerst berekenen hoeveel energie er in het gebouw terecht komt. Vanwege behoud van energie geldt <BM>P_(binnen) = P_(elek) + P_(buiten) = {Pe} + {Pin} = {Pout}.</BM> Dit is het verwarmingsvermogen. Hiermee kunnen we de warmtefactor vinden via <BM>\epsilon_w = \frac(\rm nuttig)(\rm invoer) = \frac(P_(binnen))(E_(elek)) = \frac{Pout}{Pe} = {COP}.</BM> Dit betekent dat er <M>{COP}</M> keer meer warmte aan het gebouw afgestaan wordt als dat we aan (elektrische) energie gebruiken.</Par>
	</>
}

function getFeedback(exerciseData) {
	// Check for a common error.
	const { input: { COP }, state, shared: { getCorrect, data: { equalityOptions } } } = exerciseData
	const correct = getCorrect(state)
	if (correct.subtract(1).equals(COP, equalityOptions))
		return { COP: { correct: false, text: 'Bijna! Kijk nog eens goed naar welke energie we echt als "nuttig" zien.' } }

	// Give default feedback.
	return getInputFieldFeedback('COP', exerciseData)
}