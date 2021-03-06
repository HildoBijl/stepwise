import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatInput from 'ui/form/inputs/FloatInput'
import { InputSpace } from 'ui/form/Status'

import SimpleExercise from '../types/SimpleExercise'
import { useCorrect } from '../ExerciseContainer'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getAllInputFieldsFeedback} />
}

function Problem({ a, b }) {
	return <>
		<Par>Los de vergelijking <M>a \cdot x = b</M> op voor <M>x</M>, waarbij <M>a = {a}</M> en <M>b = {b}.</M></Par>
		<InputSpace>
			<Par><FloatInput id="ans" prelabel={<M>x = </M>} label="Antwoord" size='s' /></Par>
		</InputSpace>
	</>
}

function Solution({ a, b }) {
	const x = useCorrect()
	return <Par>We beginnen met de vergelijking <BM>{a} \cdot x = {b}.</BM> Als we beide kanten van de vergelijking delen door <M>{a}</M> krijgen we <BM>x = \frac{b}{a} = {x}.</BM> Dit is de oplossing van de opgave.</Par>
}