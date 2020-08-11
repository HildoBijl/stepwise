import React from 'react'

import { selectRandomCorrect, selectRandomIncorrect } from 'step-wise/util/random'
import { Unit } from 'step-wise/edu/util/inputTypes/Unit'
import SimpleExercise from '../exerciseTypes/SimpleExercise'
import { Par } from '../../components/containers'
import { M } from '../../../util/equations'
import UnitInput from '../form/inputs/UnitInput'
import { InputSpace, WhenNotDone } from '../form/Status'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ unit }) {
	let hint = null
	if (unit.equals(new Unit('dC')))
		hint = <Par>Tip: je kunt graden Celsius ook als "gC" of "dC" invullen. (Hoofdlettergevoelig.)</Par>
	else if (unit.equals(new Unit('Ohm')))
		hint = <Par>Tip: je kunt het symbool <M>Ω</M> ook als "Ohm" invullen. (Hoofdlettergevoelig.)</Par>
	else if (unit.equals(new Unit('mum')))
		hint = <Par>Tip: je kunt het symbool <M>μ</M> ook als "mu" invullen.</Par>
	else
		hint = <Par>Tip: Als vermenigvuldigingsteken kun je de ster "*" gebruiken of de punt ".". Als deelteken gebruik je de slash "/" of de pijl omlaag.</Par>

	return <>
		<Par>Voer de eenheid <M>{unit.tex}</M> letterlijk in.</Par>
		<InputSpace>
			<Par><UnitInput id="ans" prelabel={<M>{unit.tex} =</M>} label={<span>Vul hier de eenheid in</span>} size='s' autofocus={true} /></Par>
		</InputSpace>
		<WhenNotDone>{hint}</WhenNotDone>
	</>
}

function Solution({ unit }) {
	return <Par>Je klikt op het invoervak en typt <M>{unit.tex}</M> in.</Par>
}

function getFeedback({ state: { unit }, input: { ans }, progress: { solved }, shared: { data: { equalityOptions } } }) {
	const correct = !!solved
	if (correct)
		return { ans: { correct, text: selectRandomCorrect() } }

	// Devise feedback text.
	let text
	if (unit.equals(ans, { comparePrefixes: true }))
		text = <>Technisch correct, maar je moet de eenheid <strong>letterlijk</strong> overnemen, inclusief volgorde.</>
	else if (unit.equals(ans))
		text = <>Technisch correct, maar dit is een heel andere schrijfwijze. Neem de eenheid <strong>letterlijk</strong> over.</>
	else
		text = selectRandomIncorrect()
	return { ans: { correct, text } }
}