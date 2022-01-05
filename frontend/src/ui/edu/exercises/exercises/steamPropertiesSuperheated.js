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

function Problem({ p, T }) {
	return <>
		<Par>We bekijken oververhitte stoom bij <M>{p}</M> en <M>{T}.</M> Wat zijn de specifieke enthalpie en specifieke entropie?</Par>
		<InputSpace>
			<Par>
				<FloatUnitInput id="h" prelabel={<M>h =</M>} label="Specifieke enthalpie" size="s" />
				<FloatUnitInput id="s" prelabel={<M>s =</M>} label="Specifieke entropie" size="s" />
			</Par>
		</InputSpace>
	</>
}

function Solution() {
	const { p, T, h, s } = useSolution()
	return <Par>In de tabellen voor oververhitte stoom kunnen we opzoeken dat bij een druk van <M>{p}</M> en een temperatuur van <M>{T}</M> we een specifieke enthalpie hebben van <M>h = {h}</M> en een specifieke entropie van <M>s = {s}.</M></Par>
}