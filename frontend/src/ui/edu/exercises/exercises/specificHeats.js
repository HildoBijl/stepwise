import React from 'react'

import * as gasProperties from 'step-wise/data/gasProperties'

import { M } from 'util/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'

import SimpleExercise from '../types/SimpleExercise'
import { getFloatUnitComparisonFeedback } from '../util/feedback'

const English = {
	air: 'air',
	argon: 'argon',
	carbonDioxide: 'carbon dioxide',
	carbonMonoxide: 'carbon monoxide',
	helium: 'helium',
	hydrogen: 'hydrogen',
	methane: 'methane',
	nitrogen: 'nitrogen',
	oxygen: 'oxygen',
}
const Dutch = {
	air: 'lucht',
	argon: 'argon',
	carbonDioxide: 'koolstofdioxide',
	carbonMonoxide: 'koolstofmonoxide',
	helium: 'helium',
	hydrogen: 'waterstof',
	methane: 'methaan',
	nitrogen: 'stikstof',
	oxygen: 'zuurstof',
}

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ medium }) {
	return <>
		<Par>Zoek de soortelijke warmten <M>c_v</M> en <M>c_p</M> op van <strong>{Dutch[medium]}</strong>. Voer je antwoorden zo nauwkeurig mogelijk in.</Par>
		<InputSpace>
			<Par>
				<FloatUnitInput id="anscv" prelabel={<M>c_v =</M>} label={<span><M>c_v</M></span>} size="s" />
				<FloatUnitInput id="anscp" prelabel={<M>c_p =</M>} label={<span><M>c_p</M></span>} size="s" />
			</Par>
		</InputSpace>
	</>
}

function Solution({ medium }) {
	return <>
		<Par>Voor {Dutch[medium]} geldt <M>c_v = {gasProperties[medium].cv}</M> en <M>c_p = {gasProperties[medium].cp}</M>. Merk op dat de exacte waarden iets kunnen verschillen, omdat ze toch een klein beetje variëren met bijvoorbeeld temperatuur.</Par>
		<Par>Als je de bovenstaande waarden wilt vinden, dan kun je achterin een thermodynamicaboek kijken: er is vast een bijlage met eigenschappen van gassen. Anders kun je ook Googlen naar "specific heat of {English[medium]}". Zoeken in het Engels geeft vaak meer/betere resultaten dan het Nederlands.</Par>
	</>
}

const getFeedback = (exerciseData) => {
	const { state, input, progress, shared, prevInput, prevFeedback } = exerciseData
	const { medium } = state
	const { anscv, anscp } = input
	const { data } = shared
	const { equalityOptions } = data

	const { cv, cp } = gasProperties[medium]

	return {
		anscv: getFloatUnitComparisonFeedback(cv, anscv, { equalityOptions: equalityOptions, solved: progress.solved, prevInput: prevInput.anscv, prevFeedback: prevFeedback.anscv }),
		anscp: getFloatUnitComparisonFeedback(cp, anscp, { equalityOptions: equalityOptions, solved: progress.solved, prevInput: prevInput.anscp, prevFeedback: prevFeedback.anscp }),
	}
}