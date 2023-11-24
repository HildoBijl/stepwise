import React from 'react'

import { pressure as pConversion } from 'step-wise/data/conversions'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'

import { SimpleExercise } from 'ui/eduTools'
import { useSolution } from 'ui/eduTools'
import { getInputFieldFeedback } from '../util/feedback'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ p, type }) {
	const description = [
		<Par>Schrijf de druk <M>p = {p}</M> in bar.</Par>, // p in Pa.
		<Par>Schrijf de druk <M>p = {p}</M> in standaard eenheden.</Par>, // p in Pa. Strikvraag.
		<Par>Schrijf de druk <M>p = {p}</M> in Pascal.</Par>, // p in bar.
		<Par>Schrijf de druk <M>p = {p}</M> in standaard eenheden.</Par>, // p in bar.
	][type]

	return <>
		{description}
		<InputSpace>
			<Par><FloatUnitInput id="ans" prelabel={<M>p =</M>} label="Druk" size="s" /></Par>
		</InputSpace>
	</>
}

function Solution({ p, type }) {
	const correctAnswer = useSolution()

	switch (type) {
		case 0:
			return <Par>Een bar is <M>{pConversion.float}</M> Pascal. Om van Pascal naar bar te gaan delen we dus door <M>{pConversion}.</M> Hiermee krijgen we <BM>p = \frac{p}{pConversion} = {correctAnswer}.</BM></Par>

		case 1:
			return <Par>Dit is een strikvraag. De druk staat al in standaard eenheden (Pascal). Het antwoord is dus gewoon <M>p = {correctAnswer}.</M></Par>

		case 2:
			return <Par>Een bar is <M>{pConversion.float}</M> Pascal. Om van bar naar Pascal te gaan vermenigvuldigen we dus met <M>{pConversion}.</M> Hiermee krijgen we <BM>p = {p} \cdot {pConversion} = {correctAnswer}.</BM></Par>

		case 3:
			return <Par>De standaard eenheid van druk is Pascal, en een bar is <M>{pConversion.float}</M> Pascal. Om van bar naar Pascal te gaan vermenigvuldigen we daarom met <M>{pConversion}.</M> Hiermee krijgen we <BM>p = {p} \cdot {pConversion} = {correctAnswer}.</BM></Par>

		default:
			throw new Error(`Invalid exercise type "${type}".`)
	}
}

function getFeedback(exerciseData) {
	return getInputFieldFeedback('ans', exerciseData, { text: { unit: getUnitMessage(exerciseData.state.type) } })
}

function getUnitMessage(type) {
	if (type === 0)
		return 'Je hebt niet bar als eenheid gebruikt.'
	if (type === 1 || type === 3)
		return 'Je hebt niet de standaard eenheid van druk gebruikt.'
	if (type === 2)
		return 'Je hebt geen Pascal als eenheid gebruikt.'
}
