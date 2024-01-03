import React from 'react'

import { Unit } from 'step-wise/inputTypes'
import { temperature as TConversion } from 'step-wise/data/conversions'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { SimpleExercise, getFieldInputFeedback } from 'ui/eduTools'

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

function Solution({ T, type, ans }) {
	const solution = [
		<Par>Om van Kelvin naar graden Celsius te gaan halen we <M>{TConversion.float}</M> ervan af. Hiermee krijgen we, rekening houdend met significante getallen, <BM>T = {T.float} - {TConversion.float} = {ans}.</BM></Par>,
		<Par>Dit is een strikvraag. De temperatuur staat al in standaard eenheden (Kelvin). Het antwoord is dus gewoon <M>T = {ans}.</M></Par>,
		<Par>Om van graden Celsius naar Kelvin te gaan tellen we er <M>{TConversion.float}</M> bij op. Hiermee krijgen we, rekening houdend met significante getallen, <BM>T = {T.float} + {TConversion.float} = {ans}.</BM></Par>,
		<Par>De standaard eenheid van temperatuur is Kelvin. Om van Kelvin naar graden Celsius te gaan tellen we er <M>{TConversion.float}</M> bij op. Hiermee krijgen we, rekening houdend met significante getallen, <BM>T = {T.float} + {TConversion.float} = {ans}.</BM></Par>,
	][type]

	return <Par>{solution}</Par>
}

function getFeedback(exerciseData) {
	return getFieldInputFeedback(exerciseData, {
		ans: [
			(input, answer, { type }, correct) => !correct && !answer.unit.equals(input.unit, { type: Unit.equalityTypes.exact }) && <>{getUnitMessage(type)}</>,
		],
	})
}

function getUnitMessage(type) {
	if (type === 0)
		return 'Je hebt niet graden Celsius als eenheid gebruikt. (Tip: typ "gC" voor graden Celsius.)'
	if (type === 1 || type === 3)
		return 'Je hebt niet de standaard eenheid van temperatuur gebruikt.'
	if (type === 2)
		return 'Je hebt geen Kelvin als eenheid gebruikt.'
}
