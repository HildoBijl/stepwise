import React from 'react'

import { M } from 'util/equations'
import { Par } from 'ui/components/containers'
import IntegerInput from 'ui/form/inputs/IntegerInput'
import { InputSpace } from 'ui/form/Status'

import SimpleExercise from '../types/SimpleExercise'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} />
}

function Problem({ a, b }) {
	return <>
		<Par>Bereken de vermenigvuldiging <M>{a} \cdot {b}.</M></Par>
		<InputSpace>
			<Par><IntegerInput id="ans" label="Antwoord" prelabel={<M>{a} \cdot {b} =</M>} size="s" /></Par>
		</InputSpace>
	</>
}

function Solution({ a, b }) {
	return <Par>De oplossing is <M>{a} \cdot {b} = {a * b}.</M></Par>
}