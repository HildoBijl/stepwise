import React from 'react'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatInput } from 'ui/inputs'
import { SimpleExercise } from 'ui/eduTools'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} />
}

function Problem({ a, b, p, c }) {
	return <>
		<Par>Los de vergelijking <M>{a} {b.texWithPM} \cdot x^{p} = {c}</M> op voor <M>x.</M></Par>
		<InputSpace>
			<Par><FloatInput id="ans" prelabel={<M>x = </M>} label="Antwoord" size='s' /></Par>
		</InputSpace>
	</>
}

function Solution({ a, b, p, c, cMinusA, cMinusADivB, ans }) {
	return <Par>We beginnen met de vergelijking <BM>{a} {b.texWithPM} \cdot x^{p} = {c}.</BM> We willen de exponent isoleren (als enige aan één kant hebben). Hiervoor brengen we eerst <M>{a}</M> naar de andere kant, via <BM>{b} \cdot x^{p} = {c} {a.applyMinus().texWithPM} = {cMinusA}.</BM> Vervolgens willen we ook <M>{b}</M> wegwerken. Dit lukt als we beide kanten hierdoor delen. Dat geeft ons <BM>x^{p} = \frac{cMinusA}{b} = {cMinusADivB}.</BM> Nu hebben we de exponent geïsoleerd. Om vervolgens nog de macht weg te werken, doen we beide kanten van de vergelijking tot de macht <M>\frac(1)({p}).</M> Hiermee vinden we de oplossing <BM>x = {cMinusADivB.texWithBrackets}^(\frac(1)({p})) = {ans}.</BM></Par>
}
