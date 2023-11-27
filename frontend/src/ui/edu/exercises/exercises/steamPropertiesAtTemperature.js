import React from 'react'

import { Par, M } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { SimpleExercise, useSolution, getAllInputFieldsFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getAllInputFieldsFeedback} />
}

function Problem({ T, type }) {
	return <>
		<Par>We bekijken water met een temperatuur van <M>{T}.</M> {type === 1 ? `We hebben te maken met een verzadigde vloeistof: het water kookt maar is nog vloeibaar.` : `We hebben te maken met een verzadigde damp: al het water is net verdampt.`} Wat is de druk van het water? En wat zijn de specifieke enthalpie en specifieke entropie?</Par>
		<InputSpace>
			<Par>
				<FloatUnitInput id="p" prelabel={<M>p =</M>} label="Druk" size="s" />
				<FloatUnitInput id="h" prelabel={<M>h =</M>} label="Specifieke enthalpie" size="s" />
				<FloatUnitInput id="s" prelabel={<M>s =</M>} label="Specifieke entropie" size="s" />
			</Par>
		</InputSpace>
	</>
}

function Solution() {
	const { T, type, p, h, s } = useSolution()
	return <Par>In de stoomtabellen kunnen we opzoeken dat bij een kooktemperatuur van <M>{T}</M> een druk hoort van <M>{p}.</M> Tevens hebben we te maken met {type === 1 ? `verzadigde vloeistof` : `verzadigde damp`} waarmee we kunnen vinden dat <M>h = {h}</M> en <M>s = {s}.</M></Par>
}