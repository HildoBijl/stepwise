import React from 'react'

import { Dutch } from 'ui/lang/gases'
import { Par, M } from 'ui/components'
import { InputSpace } from 'ui/form'
import { QuantityInput } from 'ui/inputs'
import { MonoExercise } from 'ui/eduTools'

export default function Exercise() {
	return <MonoExercise Problem={Problem} Solution={Solution} />
}

function Problem({ medium }) {
	return <>
		<Par>Zoek de <M>k</M>-waarde (de verhouding van soortelijke warmten) van <strong>{Dutch[medium]}</strong> op.</Par>
		<InputSpace>
			<Par><QuantityInput id="k" prelabel={<M>k =</M>} label={<span><M>k</M>-waarde</span>} size="s" validate={QuantityInput.validation.any} /></Par>
		</InputSpace>
	</>
}

function Solution({ medium, k }) {
	return <>
		<Par>De <M>k</M>-waarde (de verhouding van soortelijke warmten) van {Dutch[medium]} is <M>{k}.</M></Par>
	</>
}
