import React from 'react'

import { selectRandomCorrect, selectRandomIncorrect } from 'step-wise/util/random'

import SimpleExercise from '../types/SimpleExercise'
import { Par } from '../../../components/containers'
import { M } from '../../../../util/equations'
import FloatInput from '../../../form/inputs/FloatInput'
import { InputSpace } from '../../../form/Status'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ x }) {
	return <>
		<Par>Voer het getal <M>{x.tex}</M> in.</Par>
		<InputSpace>
			<Par><FloatInput id="ans" prelabel={<M>{x.tex}=</M>} label={<span>Vul hier <M>{x.tex}</M> in</span>} size='s' /></Par>
		</InputSpace>
	</>
}

function Solution({ x }) {
	return <Par>Je klikt op het invoervak en typt <M>{x.tex}</M> in.</Par>
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