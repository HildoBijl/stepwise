import React from 'react'

import { Translation, Check } from 'i18n'
import { Par, M } from 'ui/components'
import { InputSpace, selectRandomCorrect, selectRandomIncorrect } from 'ui/form'
import { IntegerInput } from 'ui/inputs'
import { SimpleExercise } from 'ui/eduTools'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ x }) {
	return <>
		<Par><Translation entry="text">Enter the number <M>{x}</M>.</Translation></Par>
		<InputSpace>
			<Par><IntegerInput id="ans" prelabel={<M>{x}=</M>} label={<Translation entry="label">Enter <M>{x}</M> here</Translation>} size='s' /></Par>
		</InputSpace>
	</>
}

function Solution({ x }) {
	return <Par><Translation>You can click on the input field and type in the number <M>{x}</M>.<Check value={x < 0}><Check.True> A potential minus sign can also be added after typing in the number. The input field is smart enough to know that the minus sign must be at the front.</Check.True></Check></Translation></Par>
}

function getFeedback({ state, input, progress }) {
	const { x } = state
	const { ans } = input
	const correct = state.x === input.ans
	if (correct)
		return { ans: { correct, text: selectRandomCorrect() } }
	return {
		ans: {
			correct,
			text: Math.abs(x) === Math.abs(ans) ? (
				ans > 0 ? <Translation entry="noMinusSign">You forgot the minus sign.</Translation> : <Translation entry="unnecessaryMinusSign">Try removing the minus sign.</Translation>
			) : selectRandomIncorrect()
		}
	}
}
