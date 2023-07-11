import React from 'react'

import * as gasProperties from 'step-wise/data/gasProperties'

import { Dutch } from 'ui/lang/gases'
import { Par, M } from 'ui/components'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form'

import SimpleExercise from '../types/SimpleExercise'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getAllInputFieldsFeedback} />
}

function Problem({ medium }) {
	return <>
		<Par>Zoek de specifieke gasconstante van <strong>{Dutch[medium]}</strong> op.</Par>
		<InputSpace>
			<Par><FloatUnitInput id="Rs" prelabel={<M>R_s =</M>} label="Specifieke gasconstante" size="s" /></Par>
		</InputSpace>
	</>
}

function Solution({ medium }) {
	return <Par>De specifieke gasconstante van {Dutch[medium]} is <M>{gasProperties[medium].Rs}.</M></Par>
}
