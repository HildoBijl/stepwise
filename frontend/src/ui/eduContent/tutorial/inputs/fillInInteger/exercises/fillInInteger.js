import React from 'react'

import { Translation, Check } from 'i18n'
import { Par, M } from 'ui/components'
import { InputSpace } from 'ui/form'
import { IntegerInput } from 'ui/inputs'
import { SimpleExercise, getFieldInputFeedback } from 'ui/eduTools'

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

function getFeedback(exerciseData) {
	return getFieldInputFeedback(exerciseData, { ans: [
		(input, solution, _, correct) => !correct && Math.abs(input) === Math.abs(solution) && (input > 0 ? exerciseData.translate('You forgot the minus sign.', 'noMinusSign') : exerciseData.translate('Try removing the minus sign.', 'unnecessaryMinusSign'))
	] })
}
