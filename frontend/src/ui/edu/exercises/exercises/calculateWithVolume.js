import React from 'react'

import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'

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

function Problem({ V, type }) {
	const description = [
		<Par>Schrijf het volume <M>V = {V.tex}</M> in liters.</Par>,
		<Par>Schrijf het volume <M>V = {V.tex}</M> in standaard eenheden.</Par>,
		<Par>Schrijf het volume <M>V = {V.tex}</M> in kubieke meters.</Par>,
		<Par>Schrijf het volume <M>V = {V.tex}</M> in standaard eenheden.</Par>,
	][type]

	return <>
		{description}
		<InputSpace>
			<Par><FloatUnitInput id="ans" prelabel={<M>V =</M>} label="Volume" size="s" /></Par>
		</InputSpace>
	</>
}

function Solution({ V, type }) {
	const { shared: { getCorrect } } = useExerciseData()
	const correctAnswer = getCorrect({ V, type })

	const prefix = V.unit.num[0].prefix
	let conversion
	switch (type) {
		case 0:
			if (!prefix) { // From cubic meters to liters.
				conversion = new FloatUnit('10^3 dm^3/m^3')
				return <Par>Een liter is per definitie een kubieke decimeter. We moeten dus van kubieke meter naar kubieke decimeter. Een meter is <M>10</M> decimeter, waardoor een kubieke meter gelijk is aan <M>10^3</M> kubieke decimeter. De conversiefactor is daarom <M>{conversion.tex}</M>. Hiermee vinden we <BM>V = {V.tex} \cdot {conversion.tex} = {correctAnswer.useUnit('dm^3').tex} = {correctAnswer.tex}.</BM></Par>
			}
			switch (prefix.letter) {
				case 'd':
					return <Par>Een liter is per definitie een kubieke decimeter. Het volgt dus direct dat <BM>V = {correctAnswer.tex}.</BM></Par>

				case 'c':
					conversion = new FloatUnit('10^3 cm^3/dm^3')
					return <Par>Een liter is per definitie een kubieke decimeter. We moeten dus van kubieke centimeter naar kubieke decimeter. Een decimeter is <M>10</M> centimeter, waardoor een kubieke decimeter gelijk is aan <M>10^3</M> kubieke centimeter. De conversiefactor is daarom <M>{conversion.tex}</M>. Hiermee vinden we <BM>V = {`\\frac{${V.tex}}{${conversion.tex}}`} = {correctAnswer.useUnit('dm^3').tex} = {correctAnswer.tex}.</BM></Par>

				default:
					throw new Error(`Invalid prefix letter "${prefix.letter}".`)
			}

		case 1:
			if (!prefix)
				return <Par>Dit is een strikvraag. Het volume staat al in standaard eenheden (kubieke meters). Het antwoord is dus gewoon <M>V = {correctAnswer.tex}</M>.</Par>

			const word = prefix.letter === 'c' ? 'centimeter' : 'decimeter'
			conversion = new FloatUnit(`10^${-3 * prefix.power} ${prefix.letter}m^3/m^3`)
			return <Par>De standaard eenheid van volume is kubieke meters. We weten dat een meter gelijk is aan <M>{prefix.power === -1 ? '10' : '10^2'}</M> {word}. Een kubieke meter is dus gelijk aan <M>{conversion.float.tex}</M> kubieke {word}. Het volume is daarmee te vinden als <BM>V = {`\\frac{${V.tex}}{${conversion.tex}}`} = {correctAnswer.tex}.</BM></Par>

		case 2:
		case 3:
			conversion = new FloatUnit('10^3 dm^3/m^3')
			const V_in_dm = V.useUnit('dm^3')
			return <Par>{type === 2 ? 'We willen' : 'De standaard eenheid van volume is kubieke meters. We willen dus'} van liters naar kubieke meters gaan. Als eerste merken we op dat een liter een kubieke decimeter is. Oftewel, <BM>V = {V_in_dm.tex}.</BM> Vervolgens gaan we van kubieke decimeters naar kubieke meters. Een meter is <M>10</M> decimeter, waardoor een kubieke meter gelijk is aan <M>10^3</M> kubieke decimeter. De conversiefactor is dus <M>{conversion.tex}</M>. Hiermee vinden we <BM>V = {`\\frac{${V_in_dm.tex}}{${conversion.tex}}`} = {correctAnswer.tex}.</BM></Par>

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
		return 'Je hebt niet liters als eenheid gebruikt.'
	if (type === 1 || type === 3)
		return 'Je hebt niet de standaard eenheid van volume gebruikt.'
	if (type === 2)
		return 'Je hebt geen kubieke meter als eenheid gebruikt.'
}
