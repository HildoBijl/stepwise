import React from 'react'

import * as gasProperties from 'step-wise/data/gasProperties'

import { Dutch } from 'ui/lang/gases'
import { Par, M } from 'ui/components'
import FloatUnitInput, { any } from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/FormPart'

import SimpleExercise from '../types/SimpleExercise'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getAllInputFieldsFeedback} />
}

function Problem({ medium }) {
	return <>
		<Par>Zoek de <M>k</M>-waarde (de verhouding van soortelijke warmten) van <strong>{Dutch[medium]}</strong> op.</Par>
		<InputSpace>
			<Par><FloatUnitInput id="k" prelabel={<M>k =</M>} label={<span><M>k</M>-waarde</span>} size="s" validate={any} /></Par>
		</InputSpace>
	</>
}

function Solution({ medium }) {
	return <>
		<Par>De <M>k</M>-waarde (de verhouding van soortelijke warmten) van {Dutch[medium]} is <M>{gasProperties[medium].k}.</M></Par>
	</>
}