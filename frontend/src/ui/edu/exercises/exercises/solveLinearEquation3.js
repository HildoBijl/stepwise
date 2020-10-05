import React from 'react'

import { M, BM } from 'util/equations'
import { Par } from 'ui/components/containers'
import FloatInput from 'ui/form/inputs/FloatInput'
import { InputSpace } from 'ui/form/Status'

import SimpleExercise from '../types/SimpleExercise'
import { useExerciseData } from '../ExerciseContainer'
import { getDefaultFeedback } from '../util/feedback'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ a, b, c, d }) {
	return <>
		<Par>Los de vergelijking <M>{a.tex} x {b.texWithPM} = {c.tex} x {d.texWithPM}</M> op voor <M>x</M>.</Par>
		<InputSpace>
			<Par><FloatInput id="ans" prelabel={<M>x = </M>} label="Antwoord" size='s' /></Par>
		</InputSpace>
	</>
}

function Solution({ a, b, c, d }) {
	const { shared: { getCorrect } } = useExerciseData()
	const x = getCorrect({ a, b, c, d })
	const ac = a.subtract(c, true)
	const db = d.subtract(b, true)

	return <Par>Om een lineaire vergelijking als deze op te lossen, willen we eerst alle termen met <M>x</M> naar links halen en alle termen zonder <M>x</M> naar rechts. Hiermee vinden we <BM>{a.tex} x {c.applyMinus().texWithPM} x = {b.applyMinus().tex} {d.texWithPM}.</BM> Vervolgens versimpelen we deze vergelijking tot <BM>{ac.tex} x = {db.tex}.</BM> Als laatste stap delen we beide kanten door <M>{ac.tex}</M> waarmee we uitkomen op <BM>x = {`\\frac{${db.tex}}{${ac.tex}}`} = {x.tex}.</BM></Par>
}

function getFeedback(exerciseData) {
	return getDefaultFeedback('ans', exerciseData)
}