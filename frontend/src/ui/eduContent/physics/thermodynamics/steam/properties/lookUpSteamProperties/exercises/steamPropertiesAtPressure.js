import React from 'react'

import { Par, M } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { SimpleExercise } from 'ui/eduTools'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} />
}

function Problem({ p, type }) {
	return <>
		<Par>We bekijken water met een druk van <M>{p}.</M> {type === 1 ? `We hebben te maken met een verzadigde vloeistof: het water kookt maar is nog vloeibaar.` : `We hebben te maken met een verzadigde damp: al het water is net verdampt.`} Wat is de temperatuur van het water? En wat zijn de specifieke enthalpie en specifieke entropie?</Par>
		<InputSpace>
			<Par>
				<FloatUnitInput id="T" prelabel={<M>T =</M>} label="Temperatuur" size="s" />
				<FloatUnitInput id="h" prelabel={<M>h =</M>} label="Specifieke enthalpie" size="s" />
				<FloatUnitInput id="s" prelabel={<M>s =</M>} label="Specifieke entropie" size="s" />
			</Par>
		</InputSpace>
	</>
}

function Solution({ p, type, T, h, s }) {
	return <Par>In de stoomtabellen kunnen we opzoeken dat bij een druk van <M>{p}</M> een kooktemperatuur hoort van <M>{T}.</M> Tevens hebben we te maken met {type === 1 ? `verzadigde vloeistof` : `verzadigde damp`} waarmee we kunnen vinden dat <M>h = {h}</M> en <M>s = {s}.</M></Par>
}
