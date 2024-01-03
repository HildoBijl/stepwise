import React from 'react'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatInput } from 'ui/inputs'
import { SimpleExercise, getAllInputFieldsFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getAllInputFieldsFeedback} />
}

function Problem({ a, b, c, d }) {
	return <>
		<Par>Los de vergelijking <M>{a} x {b.texWithPM} = {c} x {d.texWithPM}</M> op voor <M>x.</M></Par>
		<InputSpace>
			<Par><FloatInput id="ans" prelabel={<M>x = </M>} label="Antwoord" size='s' /></Par>
		</InputSpace>
	</>
}

function Solution({ a, b, c, d, ac, db, ans }) {
	return <Par>Om een lineaire vergelijking als deze op te lossen, willen we eerst alle termen met <M>x</M> naar links halen en alle termen zonder <M>x</M> naar rechts. Hiermee vinden we <BM>{a} x {c.applyMinus().texWithPM} x = {b.applyMinus()} {d.texWithPM}.</BM> Vervolgens versimpelen we deze vergelijking tot <BM>{ac} x = {db}.</BM> Als laatste stap delen we beide kanten door <M>{ac}</M> waarmee we uitkomen op <BM>x = \frac{db}{ac} = {ans}.</BM></Par>
}
