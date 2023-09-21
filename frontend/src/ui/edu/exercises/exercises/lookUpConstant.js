import React from 'react'

import * as constants from 'step-wise/data/constants'

import { selectRandomCorrect } from 'util/feedbackMessages'

import { Par, M } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'

import SimpleExercise from '../types/SimpleExercise'

const descriptions = {
	c: <span>de snelheid van het licht <M>c</M></span>,
	g: <span>de valversnelling <M>g</M></span>,
	R: <span>de universele gasconstante <M>R</M></span>,
	e: <span>de (elementaire) lading van een elektron <M>e</M></span>,
	k: <span>de Boltzmann constante <M>k</M></span>,
	G: <span>de universele gravitatieconstante <M>G</M></span>,
}

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ constant }) {
	return <>
		<Par>Zoek {descriptions[constant]} op. Voer je antwoord zo nauwkeurig mogelijk in.</Par>
		<InputSpace>
			<Par><FloatUnitInput id="ans" prelabel={<M>{constant} =</M>} label="Vul hier de constante in" size="s" /></Par>
		</InputSpace>
	</>
}

function Solution({ constant }) {
	return <Par>De waarde van <M>{constant}</M> is <M>{constants[constant]}.</M></Par>
}

function getFeedback({ state: { constant }, input: { ans }, progress: { solved }, shared: { data: { comparison } } }) {
	const correct = !!solved
	if (correct)
		return { ans: { correct, text: selectRandomCorrect() } }

	const c = constants[constant]
	if (!c.unit.equals(ans.unit, { checkSize: false }))
		return { ans: { correct, text: 'Je eenheid klopt niet. Kijk daar eerst eens naar.' } }
	if (c.equals(ans, { relativeMargin: 10 * comparison.default.relativeMargin }))
		return { ans: { correct, text: 'Je zit er net naast! Voer het iets nauwkeuriger in.' } }
	return { ans: { correct, text: 'Je eenheid klopt, maar je getal nog niet.' } }
}