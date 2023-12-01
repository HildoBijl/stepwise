import React from 'react'

import { Par, M, BM, BMList, BMPart } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatInput } from 'ui/inputs'
import { SimpleExercise, useSolution, getAllInputFieldsFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getAllInputFieldsFeedback} />
}

function Problem({ a, b, c, d }) {
	return <>
		<Par>Los de vergelijking <M>{a} \cdot {b} \cdot x = {c} \cdot {d}</M> op voor <M>x.</M></Par>
		<InputSpace>
			<Par><FloatInput id="ans" prelabel={<M>x = </M>} label="Antwoord" size='s' /></Par>
		</InputSpace>
	</>
}

function Solution({ a, b, c, d }) {
	const x = useSolution()
	const ab = a.multiply(b, true)
	const cd = c.multiply(d, true)
	return <Par>Het is hier handig om de vermenigvuldigingen van getallen eerst simpeler op te schrijven. We weten dat
		<BMList>
			<BMPart>{a} \cdot {b} = {ab},</BMPart>
			<BMPart>{c} \cdot {d} = {cd}.</BMPart>
		</BMList>
		De vergelijking die we moeten oplossen is dus <BM>{ab} \cdot x = {cd}.</BM> Als we beide kanten van de vergelijking delen door <M>{ab}</M> volgt <BM>x = \frac{cd}{ab} = {x}.</BM></Par>
}