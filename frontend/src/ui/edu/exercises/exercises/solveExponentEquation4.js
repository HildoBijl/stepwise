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
		<Par>Los de vergelijking <M>{a.tex} \cdot x^{`{${p.tex}}`} = {b.tex} \cdot x^{`{${p.tex}}`} {c.texWithPM}</M> op voor <M>x</M>.</Par>
		<InputSpace>
			<Par><FloatInput id="ans" prelabel={<M>x = </M>} label="Antwoord" size='s' /></Par>
		</InputSpace>
	</>
}

function Solution(state) {
	const { shared: { getCorrect } } = useExerciseData()
	const { a, b, c, p } = state
	const x = getCorrect(state)

	const aMinusB = a.subtract(b, true)
	const cDivAMinusB = c.divide(aMinusB, true)

	return <Par>We beginnen met de vergelijking <BM>{a.tex} \cdot x^{`{${p.tex}}`} = {b.tex} \cdot x^{`{${p.tex}}`} {c.texWithPM}.</BM> We zien dat hier twee exponenten inzitten. Deze hebben echter dezelfde macht! Dat betekent dat we deze termen samen kunnen voegen. Om in te zien hoe, brengen we eerst <M>{b.tex} \cdot x^{`{${p.tex}}`}</M> naar de andere kant. Zo vinden we <BM>{a.tex} \cdot x^{`{${p.tex}}`} {b.applyMinus().texWithPM} \cdot x^{`{${p.tex}}`} = {c.tex}.</BM> De twee termen links kunnen we nu samenvoegen tot <BM>\left({a.tex} {b.applyMinus().texWithPM}\right) \cdot x^{`{${p.tex}}`} = {c.tex},</BM> wat weer versimpeld kan worden tot <BM>{aMinusB.tex} \cdot x^{`{${p.tex}}`} = {c.tex}.</BM> Nu hebben we maar één exponent! Om dit verder op te lossen, brengen we ook nog <M>{aMinusB.tex}</M> naar de andere kant. Zo krijgen we <BM>x^{`{${p.tex}}`} = {`\\frac{${c.tex}}{${aMinusB.tex}}`} = {cDivAMinusB.tex}.</BM> Om tenslotte de macht weg te werken doen we beide kanten van de vergelijking tot de macht <M>{`\\frac{1}{${p.tex}}`}</M>. Hiermee vinden we de oplossing <BM>x = {cDivAMinusB.texWithBrackets}^{`\\frac{1}{${p.tex}}`} = {x.tex}.</BM></Par>
}

function getFeedback(exerciseData) {
	return getDefaultFeedback('ans', exerciseData)
}