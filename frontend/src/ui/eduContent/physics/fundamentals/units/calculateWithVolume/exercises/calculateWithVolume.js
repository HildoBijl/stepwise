import React from 'react'

import { FloatUnit, Unit } from 'step-wise/inputTypes'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { SimpleExercise, getFieldInputFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ V, type }) {
	const description = [
		<Par>Schrijf het volume <M>V = {V}</M> in liters.</Par>,
		<Par>Schrijf het volume <M>V = {V}</M> in standaard eenheden.</Par>,
		<Par>Schrijf het volume <M>V = {V}</M> in kubieke meters.</Par>,
		<Par>Schrijf het volume <M>V = {V}</M> in standaard eenheden.</Par>,
	][type]

	return <>
		{description}
		<InputSpace>
			<Par><FloatUnitInput id="ans" prelabel={<M>V =</M>} label="Volume" size="s" /></Par>
		</InputSpace>
	</>
}

function Solution({ V, type, ans }) {
	const prefix = V.unit.num[0].prefix
	let conversion
	switch (type) {
		case 0:
			if (!prefix) { // From cubic meters to liters.
				conversion = new FloatUnit('10^3 dm^3/m^3')
				return <Par>Een liter is per definitie een kubieke decimeter. We moeten dus van kubieke meter naar kubieke decimeter. Een meter is <M>10</M> decimeter, waardoor een kubieke meter gelijk is aan <M>10^3</M> kubieke decimeter. De conversiefactor is daarom <M>{conversion}.</M> Hiermee vinden we <BM>V = {V} \cdot {conversion} = {ans.setUnit('dm^3')} = {ans}.</BM></Par>
			}
			switch (prefix.letter) {
				case 'd':
					return <Par>Een liter is per definitie een kubieke decimeter. Het volgt dus direct dat <BM>V = {ans}.</BM></Par>

				case 'c':
					conversion = new FloatUnit('10^3 cm^3/dm^3')
					return <Par>Een liter is per definitie een kubieke decimeter. We moeten dus van kubieke centimeter naar kubieke decimeter. Een decimeter is <M>10</M> centimeter, waardoor een kubieke decimeter gelijk is aan <M>10^3</M> kubieke centimeter. De conversiefactor is daarom <M>{conversion}.</M> Hiermee vinden we <BM>V = \frac{V}{conversion} = {ans.setUnit('dm^3')} = {ans}.</BM></Par>

				default:
					throw new Error(`Invalid prefix letter "${prefix.letter}".`)
			}

		case 1:
			if (!prefix)
				return <Par>Dit is een strikvraag. Het volume staat al in standaard eenheden (kubieke meters). Het antwoord is dus gewoon <M>V = {ans}.</M></Par>

			const word = prefix.letter === 'c' ? 'centimeter' : 'decimeter'
			conversion = new FloatUnit(`10^${-3 * prefix.power} ${prefix.letter}m^3/m^3`)
			return <Par>De standaard eenheid van volume is kubieke meters. We weten dat een meter gelijk is aan <M>{prefix.power === -1 ? '10' : '10^2'}</M> {word}. Een kubieke meter is dus gelijk aan <M>{conversion.float}</M> kubieke {word}. Het volume is daarmee te vinden als <BM>V = \frac{V}{conversion} = {ans}.</BM></Par>

		case 2:
		case 3:
			conversion = new FloatUnit('10^3 dm^3/m^3')
			const V_in_dm = V.setUnit('dm^3')
			return <Par>{type === 2 ? 'We willen' : 'De standaard eenheid van volume is kubieke meters. We willen dus'} van liters naar kubieke meters gaan. Als eerste merken we op dat een liter een kubieke decimeter is. Oftewel, <BM>V = {V_in_dm}.</BM> Vervolgens gaan we van kubieke decimeters naar kubieke meters. Een meter is <M>10</M> decimeter, waardoor een kubieke meter gelijk is aan <M>10^3</M> kubieke decimeter. De conversiefactor is dus <M>{conversion}.</M> Hiermee vinden we <BM>V = \frac{V_in_dm}{conversion} = {ans}.</BM></Par>

		default:
			throw new Error(`Invalid exercise type "${type}".`)
	}
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
		return 'Je hebt niet liters als eenheid gebruikt.'
	if (type === 1 || type === 3)
		return 'Je hebt niet de standaard eenheid van volume gebruikt.'
	if (type === 2)
		return 'Je hebt geen kubieke meter als eenheid gebruikt.'
}
