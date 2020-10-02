import React from 'react'

import { M, BM } from 'util/equations'
import { Par } from 'ui/components/containers'
import FloatInput from 'ui/form/inputs/FloatInput'
import { InputSpace } from 'ui/form/Status'

import SimpleExercise from '../types/SimpleExercise'
import { useExerciseData } from '../ExerciseContainer'
import { getFloatComparisonFeedback } from '../util/feedback'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ a, b }) {
	return <>
		<Par>Los de vergelijking <M>a \cdot x = b</M> op voor <M>x</M>, waarbij <M>a = {a.tex}</M> en <M>b = {b.tex}.</M></Par>
		<InputSpace>
			<Par><FloatInput id="ans" prelabel={<M>x = </M>} label="Antwoord" size='s' /></Par>
		</InputSpace>
	</>
}

function Solution({ a, b }) {
	const { shared: { getCorrect } } = useExerciseData()
	const x = getCorrect({ a, b })

	return <Par>We beginnen met de vergelijking <BM>{a.tex} \cdot x = {b.tex}.</BM> Als we beide kanten van de vergelijking delen door <M>{a.tex}</M> krijgen we <BM>x = {`\\frac{${b.tex}}{${a.tex}}`} = {x.tex}.</BM> Dit is de oplossing van de opgave.</Par>
}

function getFeedback(exerciseData) {
	const { state, input: { ans }, progress: { solved }, shared: { data: { equalityOptions }, getCorrect } } = exerciseData
	return { ans: getFloatComparisonFeedback(getCorrect(state), ans, { equalityOptions, solved }) }
}