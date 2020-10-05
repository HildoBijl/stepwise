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
		<Par>Los de vergelijking <M>{a.tex} \cdot x^{`{${c.tex}}`} = {b.tex} \cdot x^{`{${d.tex}}`}</M> op voor <M>x</M>.</Par>
		<InputSpace>
			<Par><FloatInput id="ans" prelabel={<M>x = </M>} label="Antwoord" size='s' /></Par>
		</InputSpace>
	</>
}

function Solution(state) {
	const { shared: { getCorrect } } = useExerciseData()
	const { a, b, c, d } = state
	const x = getCorrect(state)

	const power = c.subtract(d, true)
	const bDivA = b.divide(a, true)

	return <Par>We beginnen met de vergelijking <BM>{a.tex} \cdot x^{`{${c.tex}}`} = {b.tex} \cdot x^{`{${d.tex}}`}.</BM> We zien dat hier twee exponenten inzitten. Dat is moeilijk op te lossen, dus willen we daar eerst één exponent van maken. Dit kan als we beide kanten van de vergelijking delen door <M>x^{`{${d.tex}}`}</M>. Hiermee vinden we <BM>{a.tex} \cdot {`\\frac{x^{${c.tex}}}{x^{${d.tex}}}`} = {b.tex},</BM> wat te vereenvoudigen valt tot <BM>{a.tex} \cdot x^{`{${power.tex}}`} = {b.tex}.</BM> Nu hebben we maar één exponent! Om dit verder op te lossen, brengen we ook nog <M>{a.tex}</M> naar de andere kant. Zo krijgen we <BM>x^{`{${power.tex}}`} = {`\\frac{${b.tex}}{${a.tex}}`} = {bDivA.tex}.</BM> Om tenslotte de macht weg te werken doen we beide kanten van de vergelijking tot de macht <M>{`\\frac{1}{${power.tex}}`}</M>. Hiermee vinden we de oplossing <BM>x = {bDivA.texWithBrackets}^{`\\frac{1}{${power.tex}}`} = {x.tex}.</BM></Par>
}

function getFeedback(exerciseData) {
	return getDefaultFeedback('ans', exerciseData)
}