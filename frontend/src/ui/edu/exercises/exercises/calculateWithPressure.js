import React from 'react'

import { pressure as pConversion } from 'step-wise/data/conversions'

import { M, BM } from 'util/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'

import { getFloatUnitComparisonFeedback } from '../util/feedback'
import SimpleExercise from '../types/SimpleExercise'
import { useExerciseData } from '../ExerciseContainer'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ p, type }) {
	const description = [
		<Par>Schrijf de druk <M>p = {p.tex}</M> in bar.</Par>, // p in Pa.
		<Par>Schrijf de druk <M>p = {p.tex}</M> in standaard eenheden.</Par>, // p in Pa. Strikvraag.
		<Par>Schrijf de druk <M>p = {p.tex}</M> in Pascal.</Par>, // p in bar.
		<Par>Schrijf de druk <M>p = {p.tex}</M> in standaard eenheden.</Par>, // p in bar.
	][type]

	return <>
		{description}
		<InputSpace>
			<Par><FloatUnitInput id="ans" prelabel={<M>p =</M>} label="Druk" size="s" /></Par>
		</InputSpace>
	</>
}

function Solution({ p, type }) {
	const { shared: { getCorrect } } = useExerciseData()
	const correctAnswer = getCorrect({ p, type })

	switch (type) {
		case 0:
			return <Par>Een bar is <M>{pConversion.float.tex}</M> Pascal. Om van Pascal naar bar te gaan delen we dus door <M>{pConversion.tex}</M>. Hiermee krijgen we <BM>p = {`\\frac{${p.tex}}{${pConversion.tex}}`} = {correctAnswer.tex}.</BM></Par>

		case 1:
			return <Par>Dit is een strikvraag. De druk staat al in standaard eenheden (Pascal). Het antwoord is dus gewoon <M>p = {correctAnswer.tex}</M>.</Par>

		case 2:
			return <Par>Een bar is <M>{pConversion.float.tex}</M> Pascal. Om van bar naar Pascal te gaan vermenigvuldigen we dus met <M>{pConversion.tex}</M>. Hiermee krijgen we <BM>p = {p.tex} \cdot {pConversion.tex} = {correctAnswer.tex}.</BM></Par>

		case 3:
			return <Par>De standaard eenheid van druk is Pascal, en een bar is <M>{pConversion.float.tex}</M> Pascal. Om van bar naar Pascal te gaan vermenigvuldigen we daarom met <M>{pConversion.tex}</M>. Hiermee krijgen we <BM>p = {p.tex} \cdot {pConversion.tex} = {correctAnswer.tex}.</BM></Par>

		default:
			throw new Error(`Invalid exercise type "${type}".`)
	}
}

function getFeedback(exerciseData) {
	const { state, input: { ans }, progress: { solved }, shared: { data: { equalityOptions }, getCorrect } } = exerciseData
	return { ans: getFloatUnitComparisonFeedback(getCorrect(state), ans, { equalityOptions, solved, text: { unit: getUnitMessage(state.type) } }) }
}

function getUnitMessage(type) {
	if (type === 0)
		return 'Je hebt niet bar als eenheid gebruikt.'
	if (type === 1 || type === 3)
		return 'Je hebt niet de standaard eenheid van druk gebruikt.'
	if (type === 2)
		return 'Je hebt geen Pascal als eenheid gebruikt.'
}
