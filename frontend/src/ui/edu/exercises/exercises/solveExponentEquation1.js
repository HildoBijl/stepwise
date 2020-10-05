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

function Problem({ a, b, c, p }) {
	return <>
		<Par>Los de volgende vergelijking op voor <M>x</M>: <BM>{`\\frac{${a.tex}}{x^{${p.tex}}} = \\frac{${b.tex}}{${c.texWithBrackets}^{${p.tex}}}`}</BM></Par>
		<InputSpace>
			<Par><FloatInput id="ans" prelabel={<M>x = </M>} label="Antwoord" size='s' /></Par>
		</InputSpace>
	</>
}

function Solution(state) {
	const { shared: { getCorrect } } = useExerciseData()
	const { a, b, c, p } = state
	const x = getCorrect(state)

	const aDivB = a.divide(b, true)
	const aDivBTimesCToP = aDivB.multiply(c.toPower(p))

	return <Par>We beginnen met de vergelijking <BM>{`\\frac{${a.tex}}{x^{${p.tex}}} = \\frac{${b.tex}}{${c.texWithBrackets}^{${p.tex}}}`}.</BM> We zien dat <M>x</M> hier in de noemer van een breuk zit. Dat is onhandig, dus willen we deze eerst omhoog krijgen. Dat kan door beide kanten van de vergelijking te vermenigvuldigen met <M>{`x^{${p.tex}}`}</M>. Zo vinden we <BM>{`${a.tex} = \\frac{${b.tex} \\cdot x^{${p.tex}}}{${c.texWithBrackets}^{${p.tex}}}`}.</BM> We willen de exponent met <M>x</M> isoleren. Hiervoor brengen we <M>{b.tex}</M> en <M>{`${c.texWithBrackets}^{${p.tex}}`}</M> naar de andere kant. Het resultaat is <BM>{`\\frac{${a.tex}}{${b.tex}} \\cdot ${c.texWithBrackets}^{${p.tex}} = x^{${p.tex}}`}.</BM> Dit valt te versimpelen tot <BM>{`x^{${p.tex}} = ${aDivBTimesCToP.tex}`}.</BM> Om tenslotte de macht weg te werken doen we beide kanten van de vergelijking tot de macht <M>{`\\frac{1}{${p.tex}}`}</M>. Zo vinden we de oplossing <BM>x = {aDivBTimesCToP.texWithBrackets}^{`\\frac{1}{${p.tex}}`} = {x.tex}.</BM></Par>
}

function getFeedback(exerciseData) {
	return getDefaultFeedback('ans', exerciseData)
}