import React from 'react'

import { selectRandomCorrect, selectRandomIncorrect } from 'step-wise/util/random'

import { M } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatInput from 'ui/form/inputs/FloatInput'
import { InputSpace } from 'ui/form/Status'

import SimpleExercise from '../types/SimpleExercise'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ x }) {
	return <>
		<Par>Voer het getal <M>{x}</M> in.</Par>
		<InputSpace>
			<Par><FloatInput id="ans" prelabel={<M>{x}=</M>} label={<span>Vul hier <M>{x}</M> in</span>} size='s' /></Par>
		</InputSpace>
	</>
}

function Solution({ x }) {
	return <Par>Je klikt op het invoervak en typt <M>{x}</M> in.</Par>
}

function getFeedback({ state: { x }, input: { ans }, progress: { solved }, shared: { data: { equalityOptions } } }) {
	const correct = !!solved
	if (correct)
		return { ans: { correct, text: selectRandomCorrect() } }

	const comparison = ans.checkEquality(x, equalityOptions)
	return {
		ans: {
			correct,
			text: comparison.magnitude !== 'OK' ?
				'Je hebt het verkeerde getal ingevoerd.' :
				comparison.numSignificantDigits !== 'OK' ?
					`Je hebt ${comparison.numSignificantDigits === 'TooSmall' ? 'te weinig' : 'te veel'} significante getallen.` : selectRandomIncorrect()
		}
	}
}