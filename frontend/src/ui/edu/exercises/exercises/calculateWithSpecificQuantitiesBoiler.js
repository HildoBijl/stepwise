import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'

import SimpleExercise from '../types/SimpleExercise'
import { useCorrect } from '../ExerciseContainer'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getAllInputFieldsFeedback} />
}

function Problem({ Q, m }) {
	return <>
		<Par>We meten een dag lang een CV-ketel in een huis door. Gedurende deze dag is er <M>{m}</M> aan water doorgestroomd. Dit water heeft in totaal <M>{Q}</M> aan warmte toegevoerd gekregen. Ga ervan uit dat deze warmte gelijkmatig aan het water is toegevoerd: elke liter water is evenveel verwarmd. Wat is de specifieke toegevoerde warmte?</Par>
		<InputSpace>
			<Par><FloatUnitInput id="q" prelabel={<M>q =</M>} label="Specifieke warmte" size="s" /></Par>
		</InputSpace>
	</>
}

function Solution() {
	const { Q, m, q } = useCorrect()
	const qUnit = q.setUnit('kJ/kg')
	return <Par>De specifieke warmte is simpelweg de warmte per kilogram medium. Hij is dus te vinden via <BM>q = \frac(Q)(m) = \frac{Q.float}{m.float} = {q}.</BM> Het is bij specifieke warmte de gewoonte om deze te schrijven als <M>{qUnit}</M>, omdat hij vaak een grootte van enkele honderden <M>{qUnit.unit}</M> heeft.</Par>
}