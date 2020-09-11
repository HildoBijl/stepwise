import React from 'react'

import { selectRandomCorrect, selectRandomIncorrect } from 'step-wise/util/random'
import * as specificGasConstants from 'step-wise/data/specificGasConstants'

import SimpleExercise from '../types/SimpleExercise'
import { Par } from '../../../components/containers'
import { M } from '../../../../util/equations'
import FloatUnitInput from '../../../form/inputs/FloatUnitInput'
import { InputSpace } from '../../../form/Status'

const English = {
	air: 'air',
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
		<Par>Zoek de specifieke gasconstante van <strong>{Dutch[medium]}</strong> op. Voer je antwoord zo nauwkeurig mogelijk in.</Par>
		<InputSpace>
			<Par><FloatUnitInput id="ans" prelabel={<M>R_s =</M>} label={<span>Vul hier de specifieke gasconstante in</span>} size="s" /></Par>
		</InputSpace>
	</>
}

function Solution({ medium }) {
	return <>
		<Par>De specifieke gasconstante van {Dutch[medium]} is <M>{specificGasConstants[medium].tex}</M>.</Par>
		<Par>Als je dit wilt vinden, dan kun je achterin een thermodynamicaboek kijken: er is vast een bijlage met eigenschappen van gassen. Anders kun je ook Googlen naar "specific gas constant {English[medium]}". Zoeken in het Engels geeft vaak meer/betere resultaten dan het Nederlands.</Par>
	</>
}

function getFeedback(exerciseData) {
	const { progress: { solved } } = exerciseData
	return { ans: { correct: !!solved, text: getFeedbackText(exerciseData) } }
}

function getFeedbackText(exerciseData) {
	const { state: { medium }, input: { ans }, progress: { solved }, shared: { data: { equalityOptions } } } = exerciseData

	if (solved)
		return selectRandomCorrect()

	// Get the correct answer and compare it to the input.
	const Rs = specificGasConstants[medium]
	const result = Rs.checkEquality(ans, equalityOptions)

	if (!result.unitOK)
		return 'Je eenheid klopt niet. Kijk daar eerst eens naar.'

	if (Rs.equals(ans, { ...equalityOptions, relativeMargin: 5 * equalityOptions.relativeMargin }))
		return 'Je zit er net naast! Voer het iets nauwkeuriger in.'

	if (result.magnitude !== 'OK')
		return `Je eenheid klopt maar je getal is te ${result.magnitude === 'TooLarge' ? 'groot' : 'klein'}.`

	return selectRandomIncorrect() // Should not happen.
}