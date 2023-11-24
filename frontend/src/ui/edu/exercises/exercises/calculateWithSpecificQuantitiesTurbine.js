import React from 'react'

import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'

import { SimpleExercise } from 'ui/eduTools'
import { useSolution } from 'ui/eduTools'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getAllInputFieldsFeedback} />
}

function Problem({ wt, m }) {
	return <>
		<Par>We laten enkele minuten lang een stoomturbine draaien. In deze tijd stroomt <M>{m}</M> stoom door de turbine. De stoomturbine gebruikt deze stoom om arbeid op te wekken. De specifieke technische arbeid is hierbij <M>{wt}.</M> Wat is de totaal opgewekte technische arbeid?</Par>
		<InputSpace>
			<Par><FloatUnitInput id="Wt" prelabel={<M>W_t =</M>} label="Technische arbeid" size="s" /></Par>
		</InputSpace>
	</>
}

function Solution() {
	const { wt, m, Wt } = useSolution()
	const wtUnit = wt.multiply(new FloatUnit('1.000000 kg')).setUnit('kJ')
	return <Par>De specifieke technische arbeid <M>w_t = {wt.setUnit('kJ/kg')}</M> betekent dat elke kilogram stoom zorgt voor <M>{wtUnit}</M> aan arbeid. We hebben in totaal <M>{m}</M> aan stoom. Dit zorgt voor een totale technische arbeid van <BM>W_t = mw_t = {m.float} \cdot {wt.float} = {Wt} = {Wt.setUnit('GJ')}.</BM> Dit is een grote hoeveelheid arbeid, maar dat is te verwachten van een stoomturbine die meerdere minuten draait.</Par>
}