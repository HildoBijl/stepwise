import React from 'react'

import { selectRandomCorrect, selectRandomIncorrect } from 'util/feedbackMessages'

import { Check } from 'i18n'
import { Par, M } from 'ui/components'
import { InputSpace } from 'ui/form'
import { IntegerInput } from 'ui/inputs'

import SimpleExercise from '../types/SimpleExercise'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ translate, x }) {
	return translate(<>
		<Par>Enter the number <M>{x}</M>.</Par>
		<InputSpace>
			<Par><IntegerInput id="ans" prelabel={<M>{x}=</M>} label={<span>Vul hier <M>{x}</M> in</span>} size='s' /></Par>
		</InputSpace>
	</>)
}

function Solution({ translate, x }) {
	return translate(<>
		<Par>You can click on the input field and type in the number <M>{x}</M>.<Check value={x < 0}><Check.True> A potential minus sign can also be added after typing in the number. The input field is smart enough to know that the minus sign must be at the front.</Check.True></Check></Par>
	</>)
}

function getFeedback({ state, input, progress, translate }) {
	const { x } = state
	const { ans } = input
	const correct = state.x === input.ans
	if (correct)
		return { ans: { correct, text: selectRandomCorrect() } }
	return {
		ans: {
			correct,
			text: Math.abs(x) === Math.abs(ans) ? (
				ans > 0 ? translate('You forgot the minus sign.', 'noMinusSign') : translate('Try removing the minus sign.', 'unnecessaryMinusSign')
			) : selectRandomIncorrect()
		}
	}
}
