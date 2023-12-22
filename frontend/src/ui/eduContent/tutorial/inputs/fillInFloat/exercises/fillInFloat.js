import React from 'react'

import { Par, M } from 'ui/components'
import { InputSpace, selectRandomCorrect, selectRandomIncorrect } from 'ui/form'
import { FloatInput } from 'ui/inputs'
import { SimpleExercise } from 'ui/eduTools'

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
	return <Par>Je klikt op het invoervak en typt <M>{x}</M> in. {x.power !== 0 ? 'Voor de tienmacht gebruik je het keer-teken "*". Je hoeft dan de "10" niet zelf te typen: dat snapt het invoerveld vanzelf. Eventueel is de shortcut "e" (vanuit de wetenschappelijke notatie) ook mogelijk.' : ''}</Par>
}

function getFeedback({ state: { x }, input: { ans }, progress: { solved }, shared: { data: { comparison } } }) {
	const correct = !!solved
	if (correct)
		return { ans: { correct, text: selectRandomCorrect() } }

	const equalityData = ans.checkEquality(x, comparison)
	return {
		ans: {
			correct,
			text: equalityData.magnitude !== 'OK' ?
				'Je hebt het verkeerde getal ingevoerd.' :
				equalityData.numSignificantDigits !== 'OK' ?
					`Je hebt ${equalityData.numSignificantDigits === 'TooSmall' ? 'te weinig' : 'te veel'} significante getallen.` : selectRandomIncorrect()
		}
	}
}