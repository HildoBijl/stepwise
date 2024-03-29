import React from 'react'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatInput } from 'ui/inputs'
import { SimpleExercise } from 'ui/eduTools'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} />
}

function Problem({ a, b }) {
	return <>
		<Par>Los de vergelijking <M>a \cdot x = b</M> op voor <M>x</M>, waarbij <M>a = {a}</M> en <M>b = {b}.</M></Par>
		<InputSpace>
			<Par><FloatInput id="ans" prelabel={<M>x = </M>} label="Antwoord" size='s' /></Par>
		</InputSpace>
	</>
}

function Solution({ a, b, ans }) {
	return <Par>We beginnen met de vergelijking <BM>{a} \cdot x = {b}.</BM> Als we beide kanten van de vergelijking delen door <M>{a}</M> krijgen we <BM>x = \frac{b}{a} = {ans}.</BM> Dit is de oplossing van de opgave.</Par>
}
