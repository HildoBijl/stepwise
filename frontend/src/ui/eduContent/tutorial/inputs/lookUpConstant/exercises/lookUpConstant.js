import React from 'react'

import * as constants from 'step-wise/data/constants'

import { Par, M } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { SimpleExercise } from 'ui/eduTools'

const descriptions = {
	c: <span>de snelheid van het licht <M>c</M></span>,
	g: <span>de valversnelling <M>g</M></span>,
	R: <span>de universele gasconstante <M>R</M></span>,
	e: <span>de (elementaire) lading van een elektron <M>e</M></span>,
	k: <span>de Boltzmann constante <M>k</M></span>,
	G: <span>de universele gravitatieconstante <M>G</M></span>,
}

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} />
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
