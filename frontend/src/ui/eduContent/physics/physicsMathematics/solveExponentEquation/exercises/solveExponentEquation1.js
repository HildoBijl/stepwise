import React from 'react'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatInput } from 'ui/inputs'
import { SimpleExercise } from 'ui/eduTools'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} />
}

function Problem({ a, b, c, p }) {
	return <>
		<Par>Los de volgende vergelijking op voor <M>x</M>: <BM>\frac({a})(x^{p}) = \frac({b})({c.texWithBrackets}^{p})</BM></Par>
		<InputSpace>
			<Par><FloatInput id="ans" prelabel={<M>x = </M>} label="Antwoord" size='s' /></Par>
		</InputSpace>
	</>
}

function Solution({ a, b, c, p, aDivB, aDivBTimesCToP, ans }) {
	return <Par>We beginnen met de vergelijking <BM>\frac({a})(x^{p}) = \frac({b})({c.texWithBrackets}^{p}).</BM> We zien dat <M>x</M> hier in de noemer van een breuk zit. Dat is onhandig, dus willen we deze eerst omhoog krijgen. Dat kan door beide kanten van de vergelijking te vermenigvuldigen met <M>x^{p}.</M> Zo vinden we <BM>{a} = \frac({b})({c.texWithBrackets}^{p}) \cdot x^{p}.</BM> We willen de exponent met <M>x</M> isoleren. Hiervoor brengen we <M>{b}</M> en <M>{c.texWithBrackets}^{p}</M> naar de andere kant. Het resultaat is <BM>\frac({a} \cdot {c.texWithBrackets}^{p})({b}) = x^{p}.</BM> Dit valt te versimpelen tot <BM>x^{p} = {aDivBTimesCToP}.</BM> Om ten slotte de macht weg te werken doen we beide kanten van de vergelijking tot de macht <M>\frac(1)({p}).</M> Zo vinden we de oplossing <BM>x = {aDivBTimesCToP.texWithBrackets}^(\frac(1)({p})) = {ans}.</BM></Par>
}
