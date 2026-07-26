import React from 'react'

import { Par, M } from 'ui/components'
import { InputSpace } from 'ui/form'
import { IntegerInput } from 'ui/inputs'
import { SimpleExercise, getFieldInputFeedback } from 'ui/eduTools'

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


function getFeedback(exerciseData) {
	return getFieldInputFeedback(exerciseData, {
		ans: [
			(input, solution, _, correct) => !correct && Math.abs(input) === Math.abs(solution) && (input > 0 ? exerciseData.translate('You forgot the minus sign.', 'noMinusSign') : exerciseData.translate('Try removing the minus sign.', 'unnecessaryMinusSign'))
		]
	})
}
