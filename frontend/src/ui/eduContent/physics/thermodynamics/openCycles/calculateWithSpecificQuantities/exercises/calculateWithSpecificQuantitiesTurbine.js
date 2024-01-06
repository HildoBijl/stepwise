import React from 'react'

import { FloatUnit } from 'step-wise/inputTypes'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { SimpleExercise } from 'ui/eduTools'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} />
}

function Problem({ wt, m }) {
	return <>
		<Par>We laten enkele minuten lang een stoomturbine draaien. In deze tijd stroomt <M>{m}</M> stoom door de turbine. De stoomturbine gebruikt deze stoom om arbeid op te wekken. De specifieke technische arbeid is hierbij <M>{wt}.</M> Wat is de totaal opgewekte technische arbeid?</Par>
		<InputSpace>
			<Par><FloatUnitInput id="Wt" prelabel={<M>W_t =</M>} label="Technische arbeid" size="s" /></Par>
		</InputSpace>
	</>
}

function Solution({ wts, ms, Wt }) {
	const wtUnit = wts.multiply(new FloatUnit('1.000000 kg')).setUnit('kJ')
	return <Par>De specifieke technische arbeid <M>w_t = {wts.setUnit('kJ/kg')}</M> betekent dat elke kilogram stoom zorgt voor <M>{wtUnit}</M> aan arbeid. We hebben in totaal <M>{ms}</M> aan stoom. Dit zorgt voor een totale technische arbeid van <BM>W_t = mw_t = {ms.float} \cdot {wts.float} = {Wt} = {Wt.setUnit('GJ')}.</BM> Dit is een grote hoeveelheid arbeid, maar dat is te verwachten van een stoomturbine die meerdere minuten draait.</Par>
}
