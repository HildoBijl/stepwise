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
		<Par>Zoek de soortelijke warmten <M>c_v</M> en <M>c_p</M> op van <strong>{Dutch[medium]}</strong>. Voer je antwoorden zo nauwkeurig mogelijk in.</Par>
		<InputSpace>
			<Par>
				<FloatUnitInput id="cv" prelabel={<M>c_v =</M>} label={<span><M>c_v</M></span>} size="s" />
				<FloatUnitInput id="cp" prelabel={<M>c_p =</M>} label={<span><M>c_p</M></span>} size="s" />
			</Par>
		</InputSpace>
	</>
}

function Solution({ medium }) {
	return <>
		<Par>Voor {Dutch[medium]} geldt <M>c_v = {gasProperties[medium].cv}</M> en <M>c_p = {gasProperties[medium].cp}.</M> Merk op dat de exacte waarden iets kunnen verschillen, omdat ze toch een klein beetje variëren met bijvoorbeeld temperatuur.</Par>
		<Par>Als je de bovenstaande waarden wilt vinden, dan kun je achterin een thermodynamicaboek kijken: er is vast een bijlage met eigenschappen van gassen. Anders kun je ook Googlen naar "specific heat of {English[medium]}". Zoeken in het Engels geeft vaak meer/betere resultaten dan het Nederlands.</Par>
	</>
}

const getFeedback = (exerciseData) => {
	return getDefaultFeedback(['cv','cp'], exerciseData)
}