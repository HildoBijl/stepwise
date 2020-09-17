import React from 'react'

import { selectRandomCorrect, selectRandomIncorrect } from 'step-wise/util/random'

import SimpleExercise from '../types/SimpleExercise'
import { useExerciseData } from '../ExerciseContainer'
import { Par } from '../../../components/containers'
import { M, BM } from '../../../../util/equations'
import FloatUnitInput from '../../../form/inputs/FloatUnitInput'
import { InputSpace } from '../../../form/Status'

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
			<Par><FloatUnitInput id="ans" prelabel={<M>p =</M>} label={<span>Druk</span>} size="s" /></Par>
		</InputSpace>
	</>
}

function Solution({ p, type }) {
	const { shared: { getCorrect } } = useExerciseData()
	const correctAnswer = getCorrect({ p, type })

	const solution = [
		<Par>Om van Pascal naar bar te gaan delen we door <M>10^5</M>. Hiermee krijgen we <BM>p = {p.float.tex} / 10^5 = {correctAnswer.tex}.</BM></Par>,
		<Par>Dit is een strikvraag. De druk staat al in standaard eenheden (Pascal). Het antwoord is dus gewoon <M>p = {correctAnswer.tex}</M>.</Par>,
		<Par>Om van bar naar Pascal te gaan vermenigvuldigen we met <M>10^5</M>. Hiermee krijgen we <BM>p = {p.float.tex} \cdot 10^5 = {correctAnswer.tex}.</BM></Par>,
		<Par>De standaard eenheid van druk is Pascal. Om van bar naar Pascal te gaan vermenigvuldigen we met <M>10^5</M>. Hiermee krijgen we <BM>p = {p.float.tex} \cdot 10^5 = {correctAnswer.tex}.</BM></Par>,
	][type]

	return <Par>{solution}</Par>
}

function getFeedback(exerciseData) {
	const { progress: { solved } } = exerciseData
	return { ans: { correct: !!solved, text: getFeedbackText(exerciseData) } }
}

function getFeedbackText(exerciseData) {
	const { state: { p, type }, input: { ans }, progress: { solved }, shared: { data: { equalityOptions }, getCorrect } } = exerciseData

	if (solved)
		return selectRandomCorrect()

	// Get the correct answer and compare it to the input.
	const result = getCorrect({ p, type }).checkEquality(ans, equalityOptions)

	if (!result.unitOK) {
		if (type === 0)
			return 'Je hebt niet bar als eenheid gebruikt.'
		if (type === 1 || type === 3)
			return 'Je hebt niet de standaard eenheid van druk gebruikt.'
		if (type === 2)
			return 'Je hebt geen Pascal als eenheid gebruikt.'
	}

	if (result.magnitude !== 'OK')
		return `Je eenheid klopt maar je getal is te ${result.magnitude === 'TooLarge' ? 'groot' : 'klein'}.`

	if (result.numSignificantDigits !== 'OK')
		return `Je hebt te ${result.numSignificantDigits === 'TooLarge' ? 'veel' : 'weinig'} significante getallen.`

	return selectRandomIncorrect() // Should not happen.
}