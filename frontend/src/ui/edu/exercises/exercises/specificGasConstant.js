import React from 'react'

import * as gasProperties from 'step-wise/data/gasProperties'

import { M } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'
import { English, Dutch } from 'ui/lang/gases'

import SimpleExercise from '../types/SimpleExercise'
import { getDefaultFeedback } from '../util/feedback'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ medium }) {
	return <>
		<Par>Zoek de specifieke gasconstante van <strong>{Dutch[medium]}</strong> op. Voer je antwoord zo nauwkeurig mogelijk in.</Par>
		<InputSpace>
			<Par><FloatUnitInput id="ans" prelabel={<M>R_s =</M>} label="Specifieke gasconstante" size="s" /></Par>
		</InputSpace>
	</>
}

function Solution({ medium }) {
	return <>
		<Par>De specifieke gasconstante van {Dutch[medium]} is <M>{gasProperties[medium].Rs}.</M></Par>
		<Par>Als je dit wilt vinden, dan kun je achterin een thermodynamicaboek kijken: er is vast een bijlage met eigenschappen van gassen. Anders kun je ook Googlen naar "specific gas constant {English[medium]}". Zoeken in het Engels geeft vaak meer/betere resultaten dan het Nederlands.</Par>
	</>
}

const getFeedback = (exerciseData) => {
	return getDefaultFeedback('ans', exerciseData)
}