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

function Problem({ a, b, p, c }) {
	return <>
		<Par>Los de vergelijking <M>{a} {b.texWithPM} \cdot x^{p} = {c}</M> op voor <M>x.</M></Par>
		<InputSpace>
			<Par><FloatInput id="ans" prelabel={<M>x = </M>} label="Antwoord" size='s' /></Par>
		</InputSpace>
	</>
}

function Solution(state) {
	const { a, b, p, c } = state
	const x = useCorrect()

	const cMinusA = c.subtract(a, true)
	const cMinusADivB = cMinusA.divide(b, true)

	return <Par>We beginnen met de vergelijking <BM>{a} {b.texWithPM} \cdot x^{p} = {c}.</BM> We willen de exponent isoleren (als enige aan één kant hebben). Hiervoor brengen we eerst <M>{a}</M> naar de andere kant, via <BM>{b} \cdot x^{p} = {c} {a.applyMinus().texWithPM} = {cMinusA}.</BM> Vervolgens willen we ook <M>{b}</M> wegwerken. Dit lukt als we beide kanten hierdoor delen. Dat geeft ons <BM>x^{p} = \frac{cMinusA}{b} = {cMinusADivB}.</BM> Nu hebben we de exponent geïsoleerd. Om vervolgens nog de macht weg te werken, doen we beide kanten van de vergelijking tot de macht <M>\frac(1)({p}).</M> Hiermee vinden we de oplossing <BM>x = {cMinusADivB.texWithBrackets}^(\frac(1)({p})) = {x}.</BM></Par>
}

function getFeedback(exerciseData) {
	return getDefaultFeedback('ans', exerciseData)
}