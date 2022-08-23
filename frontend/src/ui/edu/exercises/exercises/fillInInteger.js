import React from 'react'

import { selectRandomCorrect, selectRandomIncorrect } from 'util/feedbackMessages'

import { M } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import IntegerInput from 'ui/form/inputs/IntegerInput'
import { InputSpace } from 'ui/form/FormPart'

import SimpleExercise from '../types/SimpleExercise'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ x }) {
	return <>
		<Par>Voer het getal <M>{x}</M> in.</Par>
		<InputSpace>
			<Par><IntegerInput id="ans" prelabel={<M>{x}=</M>} label={<span>Vul hier <M>{x}</M> in</span>} size='s' /></Par>
		</InputSpace>
	</>
}

function Solution({ x }) {
	return <Par>Je klikt op het invoervak en typt <M>{x}</M> in. {x < 0 ? `Het minteken kun je eventueel ook intypen na het getal. Het invoerveld snapt vanzelf dat dit minteken ervoor moet staan.` : ''}</Par>
}

function getFeedback({ state, input, progress }) {
	const { x } = state
	const { ans } = input
	const correct = progress.solved || false
	if (correct)
		return { ans: { correct, text: selectRandomCorrect() } }
	return {
		ans: {
			correct,
			text: Math.abs(x) === Math.abs(ans) ? (
				ans > 0 ? 'Je bent het minteken vergeten.' : 'Probeer het minteken te verwijderen.'
			) : selectRandomIncorrect()
		}
	}
}