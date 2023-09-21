import React from 'react'

import { Par, M } from 'ui/components'
import { InputSpace } from 'ui/form'
import { IntegerInput } from 'ui/inputs'

import SimpleExercise from '../types/SimpleExercise'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} />
}

function Problem({ a, b }) {
	return <>
		<Par>Bereken de optelsom <M>{a} + {b}.</M></Par>
		<InputSpace>
			<Par><IntegerInput id="ans" label="Antwoord" prelabel={<M>{a} + {b} =</M>} size="s" /></Par>
		</InputSpace>
	</>
}

function Solution({ a, b }) {
	return <Par>De oplossing is <M>{a} + {b} = {a + b}.</M></Par>
}
