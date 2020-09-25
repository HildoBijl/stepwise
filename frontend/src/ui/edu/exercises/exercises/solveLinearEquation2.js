import React from 'react'

import { getFloatComparisonFeedback } from '../util/feedback'
import SimpleExercise from '../types/SimpleExercise'
import { useExerciseData } from '../ExerciseContainer'
import { Par } from '../../../components/containers'
import { M, BM } from '../../../../util/equations'
import FloatInput from '../../../form/inputs/FloatInput'
import { InputSpace } from '../../../form/Status'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ a, b, c, d }) {
	return <>
		<Par>Los de vergelijking <M>{a.tex} \cdot {b.tex} \cdot x = {c.tex} \cdot {d.tex}</M> op voor <M>x</M>.</Par>
		<InputSpace>
			<Par><FloatInput id="ans" prelabel={<M>x = </M>} label={<span>Antwoord</span>} size='s' /></Par>
		</InputSpace>
	</>
}

function Solution({ a, b, c, d }) {
	const { shared: { getCorrect } } = useExerciseData()
	const x = getCorrect({ a, b, c, d })
	const ab = a.multiply(b, true)
	const cd = c.multiply(d, true)

	return <Par>Het is hier handig om de vermenigvuldigingen van getallen eerst simpeler op te schrijven. We weten dat <BM>{a.tex} \cdot {b.tex} = {ab.tex},</BM> <BM>{c.tex} \cdot {d.tex} = {cd.tex}.</BM> De vergelijking die we moeten oplossen is dus <BM>{ab.tex} \cdot x = {cd.tex}.</BM> Als we beide kanten van de vergelijking delen door <M>{ab.tex}</M> volgt <BM>x = {`\\frac{${cd.tex}}{${ab.tex}}`} = {x.tex}.</BM></Par>
}

function getFeedback(exerciseData) {
	const { state, input: { ans }, progress: { solved }, shared: { data: { equalityOptions }, getCorrect } } = exerciseData
	return { ans: getFloatComparisonFeedback(getCorrect(state), ans, { equalityOptions, solved }) }
}