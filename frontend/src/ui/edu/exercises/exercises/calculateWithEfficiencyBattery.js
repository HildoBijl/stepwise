import React from 'react'

import { Unit } from 'step-wise/inputTypes/Unit'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput, { any } from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/FormPart'

import SimpleExercise from '../types/SimpleExercise'
import { useSolution } from '../util/SolutionProvider'
import { getInputFieldFeedback } from '../util/feedback'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ E, Ein }) {
	return <>
		<Par>Een elektrische auto heeft een batterij die <M>{E}</M> op kan slaan. We laden deze batterij volledig op, van "helemaal leeg" naar "helemaal vol". Na afloop blijkt dat we <M>{Ein}</M> aan elektriciteit verbruikt hebben. Bereken het rendement van het oplaadproces.</Par>
		<InputSpace>
			<Par><FloatUnitInput id="eta" prelabel={<M>\eta =</M>} label="Rendement" size="s" validate={any} /></Par>
		</InputSpace>
	</>
}

function Solution({ E, Ein }) {
	const eta = useSolution()

	return <Par>We berekenen het rendement via <M>\frac(\rm nuttig)(\rm invoer).</M> De nuttige energie is de energie die daadwerkelijk in de batterij is aangekomen. Dit is <M>E_(\rm batterij)={E}.</M> De invoer is de daadwerkelijk gebruikte energie <M>E_(\rm in)={Ein}.</M> Zo vinden we het rendement <BM>\eta = \frac(\rm nuttig)(\rm invoer) = \frac(E_(\rm batterij))(E_(\rm in)) = \frac{E}{Ein} = {eta}.</BM> In het ideale geval komt alle gebruikte energie aan bij de batterij, maar in de praktijk vinden altijd verliezen plaats. Gelukkig zijn grote batterijen relatief efficiënt: met <M>{eta.setUnit('%')}</M> weet de batterij de meeste elektriciteit op te slaan.</Par>
}

function getFeedback(exerciseData) {
	// Check if the input is outside of the regular percentage range.
	const { input: { eta } } = exerciseData
	const message = getPercentageMessage(eta)
	if (message)
		return { eta: { correct: false, text: message } }

	// Get default feedback otherwise.
	return getInputFieldFeedback('eta', exerciseData)
}

function getPercentageMessage(percentage) {
	if (percentage.unit.equals(new Unit('%'))) {
		if (percentage.number < 0)
			return 'Een rendement kan nooit negatief zijn.'
		if (percentage.number > 100)
			return 'Een rendement kan nooit groter dan 100% zijn.'
	}

	if (percentage.unit.equals(new Unit(''))) {
		if (percentage.number < 0)
			return 'Een rendement kan nooit negatief zijn.'
		if (percentage.number > 1)
			return 'Een rendement kan nooit groter dan 1 zijn.'
	}
}