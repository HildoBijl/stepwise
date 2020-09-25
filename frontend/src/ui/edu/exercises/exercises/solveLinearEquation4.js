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

function Problem({ a, b, c, d, e }) {
	return <>
		<Par>Los de vergelijking <M>{a.tex} x {b.texWithPM} {c.texWithPM} x = {d.tex} {e.texWithPM} x</M> op voor <M>x</M>.</Par>
		<InputSpace>
			<Par><FloatInput id="ans" prelabel={<M>x = </M>} label={<span>Antwoord</span>} size='s' /></Par>
		</InputSpace>
	</>
}

function Solution({ a, b, c, d, e }) {
	const { shared: { getCorrect } } = useExerciseData()
	const x = getCorrect({ a, b, c, d, e })
	const ace = a.add(c, true).subtract(e, true)
	const db = d.subtract(b, true)
	
	return <Par>Om een lineaire vergelijking als deze op te lossen, willen we eerst alle termen met <M>x</M> naar links halen en alle termen zonder <M>x</M> naar rechts. Hiermee vinden we <BM>{a.tex} x {c.texWithPM} x {e.applyMinus().texWithPM} x = {b.applyMinus().tex} {d.texWithPM}.</BM> Vervolgens versimpelen we deze vergelijking tot <BM>{ace.tex} x = {db.tex}.</BM> Als laatste stap delen we beide kanten door <M>{ace.tex}</M> waarmee we uitkomen op <BM>x = {`\\frac{${db.tex}}{${ace.tex}}`} = {x.tex}.</BM></Par>
}

function getFeedback(exerciseData) {
	const { state, input: { ans }, progress: { solved }, shared: { data: { equalityOptions }, getCorrect } } = exerciseData
	return { ans: getFloatComparisonFeedback(getCorrect(state), ans, { equalityOptions, solved }) }
}