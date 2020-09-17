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

function Problem({ T, type }) {
	const description = [
		<Par>Schrijf de temperatuur <M>T = {T.tex}</M> in graden Celsius. Houd rekening met het aantal significante getallen.</Par>,
		<Par>Schrijf de temperatuur <M>T = {T.tex}</M> in standaard eenheden. Houd rekening met het aantal significante getallen.</Par>,
		<Par>Schrijf de temperatuur <M>T = {T.tex}</M> in Kelvin. Houd rekening met het aantal significante getallen.</Par>,
		<Par>Schrijf de temperatuur <M>T = {T.tex}</M> in standaard eenheden. Houd rekening met het aantal significante getallen.</Par>,
	][type]

	return <>
		{description}
		<InputSpace>
			<Par><FloatUnitInput id="ans" prelabel={<M>T =</M>} label={<span>Temperatuur</span>} size="s" /></Par>
		</InputSpace>
	</>
}

function Solution({ T, type }) {
	const { shared: { getCorrect } } = useExerciseData()
	const correctAnswer = getCorrect({ T, type })

	const solution = [
		<Par>Om van Kelvin naar graden Celsius te gaan halen we <M>273,15</M> ervan af. Hiermee krijgen we, rekening houdend met significante getallen, <BM>T = {T.float.tex} - 273,15 = {correctAnswer.tex}.</BM></Par>,
		<Par>Dit is een strikvraag. De temperatuur staat al in standaard eenheden (Kelvin). Het antwoord is dus gewoon <M>T = {correctAnswer.tex}</M>.</Par>,
		<Par>Om van graden Celsius naar Kelvin te gaan tellen we er <M>273,15</M> bij op. Hiermee krijgen we, rekening houdend met significante getallen, <BM>T = {T.float.tex} + 273,15 = {correctAnswer.tex}.</BM></Par>,
		<Par>De standaard eenheid van temperatuur is Kelvin. Om van Kelvin naar graden Celsius te gaan tellen we er <M>273,15</M> bij op. Hiermee krijgen we, rekening houdend met significante getallen, <BM>T = {T.float.tex} + 273,15 = {correctAnswer.tex}.</BM></Par>,
	][type]

	return <Par>{solution}</Par>
}

function getFeedback(exerciseData) {
	const { progress: { solved } } = exerciseData
	return { ans: { correct: !!solved, text: getFeedbackText(exerciseData) } }
}

function getFeedbackText(exerciseData) {
	const { state: { T, type }, input: { ans }, progress: { solved }, shared: { data: { equalityOptions }, getCorrect } } = exerciseData

	if (solved)
		return selectRandomCorrect()

	// Get the correct answer and compare it to the input.
	const result = getCorrect({ T, type }).checkEquality(ans, equalityOptions)

	if (!result.unitOK) {
		if (type === 0)
			return 'Je hebt niet graden Celsius als eenheid gebruikt.'
		if (type === 1 || type === 3)
			return 'Je hebt niet de standaard eenheid van temperatuur gebruikt.'
		if (type === 2)
			return 'Je hebt geen Kelvin als eenheid gebruikt.'
	}

	if (result.magnitude !== 'OK')
		return `Je eenheid klopt maar je getal is te ${result.magnitude === 'TooLarge' ? 'groot' : 'klein'}.`

	if (result.numSignificantDigits !== 'OK')
		return `Je hebt te ${result.numSignificantDigits === 'TooLarge' ? 'veel' : 'weinig'} significante getallen.`

	return selectRandomIncorrect() // Should not happen.
}