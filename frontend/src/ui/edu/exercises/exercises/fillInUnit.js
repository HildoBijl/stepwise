import React from 'react'

import { Unit } from 'step-wise/inputTypes/Unit'

import { selectRandomCorrect, selectRandomIncorrect } from 'ui/edu/exercises/feedbackMessages'

import { Par, M } from 'ui/components'
import { InputSpace, Hint } from 'ui/form'
import { UnitInput } from 'ui/inputs'

import SimpleExercise from '../types/SimpleExercise'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ unit }) {
	let hint = null
	if (unit.equals(new Unit('dC')))
		hint = <Par>Tip: je kunt graden Celsius ook als "gC" of "dC" invullen.</Par>
	else if (unit.equals(new Unit('Ohm')))
		hint = <Par>Tip: je kunt het symbool <M>Ω</M> ook als "Ohm" invullen.</Par>
	else if (unit.equals(new Unit('mum')))
		hint = <Par>Tip: je kunt het symbool <M>μ</M> ook als "mu" invullen.</Par>

	return <>
		<Par>Voer de eenheid <M>{unit}</M> letterlijk in. Let op: eenheden zijn altijd hoofdlettergevoelig.</Par>
		<InputSpace>
			<Par><UnitInput id="ans" prelabel={<M>{unit} =</M>} label="Vul hier de eenheid in" size="s" /></Par>
		</InputSpace>
		{hint ? <Hint>{hint}</Hint> : null}
	</>
}

function Solution({ unit }) {
	if (unit.equals(new Unit('dC')))
		return <Par>Om <M>{unit}</M> in te voeren gebruik je "gC" (graden Celsius) of "dC" (degrees Celsius).</Par>
	if (unit.equals(new Unit('Ohm')))
		return <Par>Om de eenheid <M>Ω</M> in te vullen kun je "Ohm" typen. Let op: dit is hoofdlettergevoelig! Simpelweg "ohm" typen werkt niet.</Par>
	if (unit.equals(new Unit('mum')))
		return <Par>Voor het symbool <M>μ</M> typ je "mu". Voor de eenheid <M>{unit}</M> voer je dus eigenlijk "mum" in.</Par>
	return <Par>Je klikt op het invoervak en typt <M>{unit}</M> in.<ul><li>Als vermenigvuldigingsteken kun je de ster "*" gebruiken of de punt ".". Ook de spatie werkt als short-cut.</li><li>Als deelteken gebruik je de slash "/" of de pijl omlaag.</li><li>Voor machten kun je eventueel het machtteken "^" gebruiken maar dit is niet per se nodig: direct getallen invoeren werkt ook.</li></ul></Par>
}

function getFeedback({ state: { unit }, input: { ans }, progress: { solved }, shared: { data: { comparison } } }) {
	const correct = !!solved
	if (correct)
		return { ans: { correct, text: selectRandomCorrect() } }

	// Devise feedback text.
	let text
	if (unit.equals(ans, { type: Unit.equalityTypes.sameUnits }))
		text = <>Technisch correct, maar je moet de eenheid <strong>letterlijk</strong> overnemen, inclusief volgorde.</>
	else if (unit.equals(ans, { type: Unit.equalityTypes.free }))
		text = <>Technisch correct, maar dit is een heel andere schrijfwijze. Neem de eenheid <strong>letterlijk</strong> over.</>
	else
		text = selectRandomIncorrect()
	return { ans: { correct, text } }
}