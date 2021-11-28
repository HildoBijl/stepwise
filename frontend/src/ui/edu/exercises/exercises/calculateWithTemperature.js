import React from 'react'

import { temperature as TConversion } from 'step-wise/data/conversions'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'

import SimpleExercise from '../types/SimpleExercise'
import { useSolution } from '../ExerciseContainer'
import { getInputFieldFeedback } from '../util/feedback'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ T, type }) {
	const description = [
		<Par>Schrijf de temperatuur <M>T = {T}</M> in graden Celsius. Houd rekening met het aantal significante getallen.</Par>,
		<Par>Schrijf de temperatuur <M>T = {T}</M> in standaard eenheden. Houd rekening met het aantal significante getallen.</Par>,
		<Par>Schrijf de temperatuur <M>T = {T}</M> in Kelvin. Houd rekening met het aantal significante getallen.</Par>,
		<Par>Schrijf de temperatuur <M>T = {T}</M> in standaard eenheden. Houd rekening met het aantal significante getallen.</Par>,
	][type]

	return <>
		{description}
		<InputSpace>
			<Par><FloatUnitInput id="ans" prelabel={<M>T =</M>} label="Temperatuur" size="s" /></Par>
		</InputSpace>
	</>
}

function Solution({ T, type }) {
	const correctAnswer = useSolution()
	const solution = [
		<Par>Om van Kelvin naar graden Celsius te gaan halen we <M>{TConversion.float}</M> ervan af. Hiermee krijgen we, rekening houdend met significante getallen, <BM>T = {T.float} - {TConversion.float} = {correctAnswer}.</BM></Par>,
		<Par>Dit is een strikvraag. De temperatuur staat al in standaard eenheden (Kelvin). Het antwoord is dus gewoon <M>T = {correctAnswer}.</M></Par>,
		<Par>Om van graden Celsius naar Kelvin te gaan tellen we er <M>{TConversion.float}</M> bij op. Hiermee krijgen we, rekening houdend met significante getallen, <BM>T = {T.float} + {TConversion.float} = {correctAnswer}.</BM></Par>,
		<Par>De standaard eenheid van temperatuur is Kelvin. Om van Kelvin naar graden Celsius te gaan tellen we er <M>{TConversion.float}</M> bij op. Hiermee krijgen we, rekening houdend met significante getallen, <BM>T = {T.float} + {TConversion.float} = {correctAnswer}.</BM></Par>,
	][type]

	return <Par>{solution}</Par>
}

function getFeedback(exerciseData) {
	return getInputFieldFeedback('ans', exerciseData, { text: { unit: getUnitMessage(exerciseData.state.type) } })
}

function getUnitMessage(type) {
	if (type === 0)
		return 'Je hebt niet graden Celsius als eenheid gebruikt. (Tip: typ "gC" voor graden Celsius.)'
	if (type === 1 || type === 3)
		return 'Je hebt niet de standaard eenheid van temperatuur gebruikt.'
	if (type === 2)
		return 'Je hebt geen Kelvin als eenheid gebruikt.'
}
