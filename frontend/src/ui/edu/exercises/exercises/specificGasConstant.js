import React from 'react'

import { selectRandomCorrect } from 'step-wise/util/random'
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

function getFeedback({ state: { medium }, input: { ans }, progress: { solved }, shared: { data: { equalityOptions } } }) {
	const correct = !!solved
	if (correct)
		return { ans: { correct, text: selectRandomCorrect() } }

	const c = specificGasConstants[medium]
	if (!c.unit.equals(ans.unit))
		return { ans: { correct, text: 'Je eenheid klopt niet. Kijk daar eerst eens naar.' } }
	if (c.equals(ans, { relativeMargin: 5*equalityOptions.relativeMargin }))
		return { ans: { correct, text: 'Je zit er net naast! Voer het iets nauwkeuriger in.' } }
	return { ans: { correct, text: 'Je eenheid klopt, maar je getal nog niet.' } }
}