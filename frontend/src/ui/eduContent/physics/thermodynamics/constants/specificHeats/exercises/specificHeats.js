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
		<Par>Zoek de soortelijke warmten <M>c_v</M> en <M>c_p</M> op van <strong>{Dutch[medium]}</strong>.</Par>
		<InputSpace>
			<Par>
				<FloatUnitInput id="cv" prelabel={<M>c_v =</M>} label={<span><M>c_v</M>-waarde</span>} size="s" />
				<FloatUnitInput id="cp" prelabel={<M>c_p =</M>} label={<span><M>c_p</M>-waarde</span>} size="s" />
			</Par>
		</InputSpace>
	</>
}

function Solution({ medium, cv, cp }) {
	return <>
		<Par>Voor {Dutch[medium]} geldt <M>c_v = {cv}</M> en <M>c_p = {cp}.</M> Merk op dat de exacte waarden iets kunnen verschillen, omdat ze toch een klein beetje variëren met bijvoorbeeld temperatuur.</Par>
	</>
}
