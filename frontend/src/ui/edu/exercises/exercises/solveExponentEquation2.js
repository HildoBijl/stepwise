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

function Problem({ a, b, p, c }) {
	return <>
		<Par>Los de vergelijking <M>{a.tex} {b.texWithPM} \cdot x^{`{${p.tex}}`} = {c.tex}</M> op voor <M>x</M>.</Par>
		<InputSpace>
			<Par><FloatInput id="ans" prelabel={<M>x = </M>} label="Antwoord" size='s' /></Par>
		</InputSpace>
	</>
}

function Solution(state) {
	const { shared: { getCorrect } } = useExerciseData()
	const { a, b, p, c } = state
	const x = getCorrect(state)

	const cMinusA = c.subtract(a, true)
	const cMinusADivB = cMinusA.divide(b, true)

	return <Par>We beginnen met de vergelijking <BM>{a.tex} {b.texWithPM} \cdot x^{`{${p.tex}}`} = {c.tex}.</BM> We willen de exponent isoleren (als enige aan één kant hebben). Hiervoor brengen we eerst <M>{a.tex}</M> naar de andere kant, via <BM>{b.tex} \cdot x^{`{${p.tex}}`} = {c.tex} {a.applyMinus().texWithPM} = {cMinusA.tex}.</BM> Vervolgens willen we ook <M>{b.tex}</M> wegwerken. Dit lukt als we beide kanten hierdoor delen. Dat geeft ons <BM>x^{`{${p.tex}}`} = {`\\frac{${cMinusA.tex}}{${b.tex}}`} = {cMinusADivB.tex}.</BM> Nu hebben we de exponent geïsoleerd. Om vervolgens nog de macht weg te werken, doen we beide kanten van de vergelijking tot de macht <M>{`\\frac{1}{${p.tex}}`}</M>. Hiermee vinden we de oplossing <BM>x = {cMinusADivB.texWithBrackets}^{`\\frac{1}{${p.tex}}`} = {x.tex}.</BM></Par>
}

function getFeedback(exerciseData) {
	return getDefaultFeedback('ans', exerciseData)
}