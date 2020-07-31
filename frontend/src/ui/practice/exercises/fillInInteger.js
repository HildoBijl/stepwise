import React from 'react'

import SimpleExercise from '../exerciseTypes/SimpleExercise'
import { Par } from '../exerciseTypes/util/containers'
import { M } from '../../../util/equations'
import IntegerInput from '../form/inputs/IntegerInput'
import { InputSpace } from '../form/InputSpace'
import { selectRandomly } from 'step-wise/util/random'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ x }) {
	return <>
		<Par>Voer het getal <M>{x}</M> in.</Par>
		<InputSpace>
			<Par><IntegerInput id="ans" prelabel={<M>{x}=</M>} label={<span>Vul hier <M>{x}</M> in</span>} size='s' autofocus={true} /></Par>
		</InputSpace>
	</>
}

function Solution({ x }) {
	return <Par>Je klikt op het invoervak en typt <M>{x}</M> in.</Par>
}

function getFeedback({ state, input, progress, prevProgress, shared }) {
	// const correct = shared.checkInput(state, input)
	const { x } = state
	const { ans } = input
	const correct = progress.solved || false
	return {
		ans: {
			correct,
			text: correct ? selectRandomly([
				'Dat is goed!',
				'Indrukwekkend gedaan.',
				'Geweldig, het is je gelukt!',
			]) : (Math.abs(x) === Math.abs(ans)) ? (
				ans > 0 ? 'Je bent het minteken vergeten.' : 'Probeer het minteken te verwijderen.'
			) : selectRandomly([
				'Je kunt niet eens een simpel getal intypen?',
				'Dit lijkt nergens op...',
				'Wauw ... dat was echt dramatisch.',
			])
		}
	}
}