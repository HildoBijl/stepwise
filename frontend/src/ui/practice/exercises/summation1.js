import React from 'react'

import SimpleExercise from '../exerciseTypes/SimpleExercise'
import { Par } from '../../components/containers'
import { M } from '../../../util/equations'
import IntegerInput from '../form/inputs/IntegerInput'
import { InputSpace } from '../form/Status'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} />
}

function Problem({ a, b }) {
	return <>
		<Par>Bereken de optelsom <M>{a} + {b}</M>.</Par>
		<InputSpace>
			<Par><IntegerInput id="ans" label="Antwoord" prelabel={<M>{a} + {b} =</M>} size="s" autofocus={true} /></Par>
		</InputSpace>
	</>
}

function Solution({ a, b }) {
	return <Par>De oplossing is <M>{a} + {b} = {a + b}.</M></Par>
}
