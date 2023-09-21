import React from 'react'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'

import SimpleExercise from '../types/SimpleExercise'
import { useSolution } from '../util/SolutionProvider'
import { getInputFieldFeedback } from '../util/feedback'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ Pe, Pin }) {
	return <>
		<Par>We gebruiken een warmtepomp om een gebouw te verwarmen. De warmtepomp gebruikt <M>{Pe}</M> aan elektriciteit en onttrekt hiermee <M>{Pin}</M> warmte aan de buitenlucht. Bereken de warmtefactor (COP) van de warmtepomp.</Par>
		<InputSpace>
			<Par><FloatUnitInput id="COP" prelabel={<M>\epsilon_w =</M>} label="Warmtefactor" size="s" validate={FloatUnitInput.validation.any} /></Par>
		</InputSpace>
	</>
}

function Solution({ Pe, Pin }) {
	const Pout = Pin.add(Pe, true)
	const COP = useSolution()
	return <>
		<Par>We berekenen de warmtefactor via <M>\frac(\rm nuttig)(\rm invoer).</M> Het is hierbij belangrijk om te kijken welke energiestroom daadwerkelijk nuttig is. Dit is <em>niet</em> de warmte die uit de buitenlucht onttrokken wordt. Immers, het doel is om het gebouw te verwarmen, en niet om de buitenlucht af te koelen.</Par>
		<Par>We moeten dus eerst berekenen hoeveel energie er in het gebouw terecht komt. Vanwege behoud van energie geldt <BM>P_(binnen) = P_(elek) + P_(buiten) = {Pe} + {Pin} = {Pout}.</BM> Dit is het verwarmingsvermogen. Hiermee kunnen we de warmtefactor vinden via <BM>\epsilon_w = \frac(\rm nuttig)(\rm invoer) = \frac(P_(binnen))(P_(elek)) = \frac{Pout}{Pe} = {COP}.</BM> Dit betekent dat er <M>{COP}</M> keer meer warmte aan het gebouw afgestaan wordt als dat we aan (elektrische) energie gebruiken.</Par>
	</>
}

function getFeedback(exerciseData) {
	// Check for a common error.
	const { input: { COP }, state, shared: { getSolution, data: { comparison } } } = exerciseData
	const solution = getSolution(state)
	if (solution.subtract(1).equals(COP, comparison))
		return { COP: { correct: false, text: 'Bijna! Kijk nog eens goed naar welke energie we echt als "nuttig" zien.' } }

	// Give default feedback.
	return getInputFieldFeedback('COP', exerciseData)
}