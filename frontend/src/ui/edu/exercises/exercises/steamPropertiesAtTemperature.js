import React from 'react'

import { M } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'

import SimpleExercise from '../types/SimpleExercise'
import { useSolution } from '../ExerciseContainer'
import { getAllInputFieldsFeedback } from '../util/feedback'

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