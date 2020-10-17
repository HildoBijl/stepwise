import React from 'react'

import * as gasProperties from 'step-wise/data/gasProperties'

import { M } from 'util/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput, { validNumberAndUnit } from 'ui/form/inputs/FloatUnitInput'
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
		<Par>Zoek de <M>k</M>-waarde (de verhouding van soortelijke warmten) van <strong>{Dutch[medium]}</strong> op. Voer je antwoord zo nauwkeurig mogelijk in.</Par>
		<InputSpace>
			<Par><FloatUnitInput id="ans" prelabel={<M>k =</M>} label={<span><M>k</M>-waarde</span>} size="s" validate={validNumberAndUnit} /></Par>
		</InputSpace>
	</>
}

function Solution({ medium }) {
	return <>
		<Par>De <M>k</M>-waarde (de verhouding van soortelijke warmten) van {Dutch[medium]} is <M>{gasProperties[medium].k}</M>.</Par>
		<Par>Als je dit wilt vinden, dan kun je achterin een thermodynamicaboek kijken: er is vast een bijlage met eigenschappen van gassen. Anders kun je ook Googlen naar "specific heat ratio of {English[medium]}". Zoeken in het Engels geeft vaak meer/betere resultaten dan het Nederlands.</Par>
	</>
}

const getFeedback = (exerciseData) => {
	const { state, input, progress, shared, prevInput, prevFeedback } = exerciseData
	const { medium } = state
	const { ans } = input
	const { data } = shared
	const { equalityOptions } = data

	const { k } = gasProperties[medium]

	return {
		ans: getFloatUnitComparisonFeedback(k, ans, { equalityOptions: equalityOptions, solved: progress.solved, prevInput: prevInput.ans, prevFeedback: prevFeedback.ans }),
	}
}