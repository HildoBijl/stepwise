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
		<Par>Los de vergelijking <M>{a} \cdot x^{p} = {b} \cdot x^{p} {c.texWithPM}</M> op voor <M>x</M>.</Par>
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

	return <Par>We beginnen met de vergelijking <BM>{a} \cdot x^{p} = {b} \cdot x^{p} {c.texWithPM}.</BM> We zien dat hier twee exponenten inzitten. Deze hebben echter dezelfde macht! Dat betekent dat we deze termen samen kunnen voegen. Om in te zien hoe, brengen we eerst <M>{b} \cdot x^{p}</M> naar de andere kant. Zo vinden we <BM>{a} \cdot x^{p} {b.applyMinus().texWithPM} \cdot x^{p} = {c}.</BM> De twee termen links kunnen we nu samenvoegen tot <BM>\left({a} {b.applyMinus().texWithPM}\right) \cdot x^{p} = {c},</BM> wat weer versimpeld kan worden tot <BM>{aMinusB} \cdot x^{p} = {c}.</BM> Nu hebben we maar één exponent! Om dit verder op te lossen, brengen we ook nog <M>{aMinusB}</M> naar de andere kant. Zo krijgen we <BM>x^{p} = \frac{c}{aMinusB} = {cDivAMinusB}.</BM> Om tenslotte de macht weg te werken doen we beide kanten van de vergelijking tot de macht <M>\frac(1)({p})</M>. Hiermee vinden we de oplossing <BM>x = {cDivAMinusB.texWithBrackets}^(\frac(1)({p})) = {x}.</BM></Par>
}

function getFeedback(exerciseData) {
	return getDefaultFeedback('ans', exerciseData)
}