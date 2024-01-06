import React from 'react'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatInput } from 'ui/inputs'
import { SimpleExercise } from 'ui/eduTools'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} />
}

function Problem({ a, b, c, d }) {
	return <>
		<Par>Los de vergelijking <M>{a} \cdot x^{c} = {b} \cdot x^{d}</M> op voor <M>x.</M></Par>
		<InputSpace>
			<Par><FloatInput id="ans" prelabel={<M>x = </M>} label="Antwoord" size='s' /></Par>
		</InputSpace>
	</>
}

function Solution({ a, b, c, d, power, bDivA, ans }) {
	return <Par>We beginnen met de vergelijking <BM>{a} \cdot x^{c} = {b} \cdot x^{d}.</BM> We zien dat hier twee exponenten inzitten. Dat is moeilijk op te lossen, dus willen we daar eerst één exponent van maken. Dit kan als we beide kanten van de vergelijking delen door <M>x^{d}.</M> Hiermee vinden we <BM>{a} \cdot \frac(x^{c})(x^{d}) = {b},</BM> wat te vereenvoudigen valt tot <BM>{a} \cdot x^{power} = {b}.</BM> Nu hebben we maar één exponent! Om dit verder op te lossen, brengen we ook nog <M>{a}</M> naar de andere kant. Zo krijgen we <BM>x^{power} = \frac{b}{a} = {bDivA}.</BM> Om ten slotte de macht weg te werken doen we beide kanten van de vergelijking tot de macht <M>\frac(1)({power}).</M> Hiermee vinden we de oplossing <BM>x = {bDivA.texWithBrackets}^(\frac(1)({power})) = {ans}.</BM></Par>
}
