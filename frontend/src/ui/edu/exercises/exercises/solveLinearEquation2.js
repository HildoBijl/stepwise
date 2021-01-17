import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatInput from 'ui/form/inputs/FloatInput'
import { InputSpace } from 'ui/form/Status'

import SimpleExercise from '../types/SimpleExercise'
import { useCorrect } from '../ExerciseContainer'
import { getDefaultFeedback } from '../util/feedback'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
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
	const x = useCorrect()
	const ab = a.multiply(b, true)
	const cd = c.multiply(d, true)
	return <Par>Het is hier handig om de vermenigvuldigingen van getallen eerst simpeler op te schrijven. We weten dat <BM>{a} \cdot {b} = {ab},</BM> <BM>{c} \cdot {d} = {cd}.</BM> De vergelijking die we moeten oplossen is dus <BM>{ab} \cdot x = {cd}.</BM> Als we beide kanten van de vergelijking delen door <M>{ab}</M> volgt <BM>x = \frac{cd}{ab} = {x}.</BM></Par>
}

function getFeedback(exerciseData) {
	return getDefaultFeedback('ans', exerciseData)
}