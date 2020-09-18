import React from 'react'

import { selectRandomCorrect } from 'step-wise/util/random'

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

function Problem({ a, b }) {
	return <>
		<Par>Los de vergelijking <M>a \cdot x = b</M> op, waarbij <M>a = {a.tex}</M> en <M>b = {b.tex}.</M></Par>
		<InputSpace>
			<Par><FloatInput id="ans" prelabel={<M>x = </M>} label={<span>Antwoord</span>} size='s' /></Par>
		</InputSpace>
	</>
}

function Solution({ a, b }) {
	const { shared: { getCorrect } } = useExerciseData()
	const x = getCorrect({ a, b })

	return <Par>We beginnen met de vergelijking <BM>{a.tex} \cdot x = {b.tex}.</BM> Als we beide kanten van de vergelijking delen door <M>{a.tex}</M> krijgen we <BM>x = {`\\frac{${b.tex}}{${a.tex}}`} = {x.tex}.</BM> Dit is de oplossing van de opgave.</Par>
}

function getFeedback(exerciseData) {
	const { progress: { solved } } = exerciseData
	return { ans: { correct: !!solved, text: getFeedbackText(exerciseData) } }
}

function getFeedbackText(exerciseData) {
	const { state: { a, b }, input: { ans }, progress: { solved }, shared: { data: { equalityOptions }, getCorrect } } = exerciseData

	if (solved)
		return selectRandomCorrect()
	return getFloatComparisonFeedback(getCorrect({ a, b }), ans, equalityOptions)
}