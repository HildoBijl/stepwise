import React from 'react'

import { Unit } from 'step-wise/inputTypes'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { SimpleExercise, getFieldInputFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ P, Pin }) {
	return <>
		<Par>Een generator levert een elektrisch vermogen van <M>{P}.</M> De warmte geleverd door de verbrande brandstof is <M>{Pin}.</M> Wat is het rendement van de generator?</Par>
		<InputSpace>
			<Par><FloatUnitInput id="eta" prelabel={<M>\eta =</M>} label="Rendement" size="s" validate={FloatUnitInput.validation.any} /></Par>
		</InputSpace>
	</>
}

function Solution({ P, Pin, eta }) {
	return <Par>We berekenen het rendement via <M>\frac(\rm nuttig)(\rm invoer).</M> Het nuttige vermogen hier is het elektrische vermogen <M>P_(\rm elek)={P}.</M> De energie (invoer) komt uit het verbranden van de brandstof <M>P_(\rm in)={Pin}.</M> Zo vinden we het rendement <BM>\eta = \frac(\rm nuttig)(\rm invoer) = \frac(P_(\rm elek))(P_(\rm in)) = \frac{P}{Pin} = {eta}.</BM> Dit kunnen we eventueel nog schrijven als <M>{eta.setUnit('%')}</M> maar dat is niet per se nodig.</Par>
}

function getFeedback(exerciseData) {
	return getFieldInputFeedback(exerciseData, {
		eta: (input) => getPercentageMessage(input),
	})
}

function getPercentageMessage(percentage) {
	if (percentage.unit.equals(new Unit('%'))) {
		if (percentage.number < 0)
			return 'Een rendement kan nooit negatief zijn.'
		if (percentage.number > 100)
			return 'Een rendement kan nooit groter dan 100% zijn.'
	}

	if (percentage.unit.equals(new Unit(''))) {
		if (percentage.number < 0)
			return 'Een rendement kan nooit negatief zijn.'
		if (percentage.number > 1)
			return 'Een rendement kan nooit groter dan 1 zijn.'
	}
}
