import React from 'react'

import { Dutch } from 'ui/lang/gases'
import { Par, M } from 'ui/components'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { SimpleExercise, getAllInputFieldsFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getAllInputFieldsFeedback} />
}

function Problem({ medium }) {
	return <>
		<Par>Zoek de <M>k</M>-waarde (de verhouding van soortelijke warmten) van <strong>{Dutch[medium]}</strong> op.</Par>
		<InputSpace>
			<Par><FloatUnitInput id="k" prelabel={<M>k =</M>} label={<span><M>k</M>-waarde</span>} size="s" validate={FloatUnitInput.validation.any} /></Par>
		</InputSpace>
	</>
}

function Solution({ medium, k }) {
	return <>
		<Par>De <M>k</M>-waarde (de verhouding van soortelijke warmten) van {Dutch[medium]} is <M>{k}.</M></Par>
	</>
}
