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

function Problem({ a, b, c, d, e }) {
	return <>
		<Par>Los de vergelijking <M>{a} x {b.texWithPM} {c.texWithPM} x = {d} {e.texWithPM} x</M> op voor <M>x.</M></Par>
		<InputSpace>
			<Par><FloatInput id="ans" prelabel={<M>x = </M>} label="Antwoord" size='s' /></Par>
		</InputSpace>
	</>
}

function Solution({ a, b, c, d, e }) {
	const x = useCorrect()
	const ace = a.add(c, true).subtract(e, true)
	const db = d.subtract(b, true)
	return <Par>Om een lineaire vergelijking als deze op te lossen, willen we eerst alle termen met <M>x</M> naar links halen en alle termen zonder <M>x</M> naar rechts. Hiermee vinden we <BM>{a} x {c.texWithPM} x {e.applyMinus().texWithPM} x = {b.applyMinus()} {d.texWithPM}.</BM> Vervolgens versimpelen we deze vergelijking tot <BM>{ace} x = {db}.</BM> Als laatste stap delen we beide kanten door <M>{ace}</M> waarmee we uitkomen op <BM>x = \frac{db}{ace} = {x}.</BM></Par>
}