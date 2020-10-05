import React from 'react'

import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'
import { getPrefixName, getPrefixPower } from 'step-wise/inputTypes/Unit/prefixes'

import { M, BM } from 'util/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'

import SimpleExercise from '../types/SimpleExercise'
import { useExerciseData } from '../ExerciseContainer'
import { getDefaultFeedback } from '../util/feedback'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem({ m, type, prefix }) {
	const description = [
		<Par>Schrijf de massa <M>m = {m.tex}</M> in kilogram.</Par>,
		<Par>Schrijf de massa <M>m = {m.tex}</M> in standaard eenheden.</Par>,
		<Par>Schrijf de massa <M>m = {m.tex}</M> in {getPrefixName(prefix)}gram.</Par>,
	][type]

	return <>
		{description}
		<InputSpace>
			<Par><FloatUnitInput id="ans" prelabel={<M>m =</M>} label="Massa" size="s" /></Par>
		</InputSpace>
	</>
}

function Solution({ m, type, prefix }) {
	const { shared: { getCorrect } } = useExerciseData()
	const correctAnswer = getCorrect({ m, type, prefix })

	const fromPrefix = (type === 2 ? 'k' : prefix)
	const toPrefix = (type === 2 ? prefix : 'k')
	const fromName = getPrefixName(fromPrefix)
	const toName = getPrefixName(toPrefix)
	const fromPower = getPrefixPower(fromPrefix)
	const toPower = getPrefixPower(toPrefix)

	const conversion = (fromPower > toPower ?
		new FloatUnit(`10^${fromPower - toPower} ${toPrefix}g/${fromPrefix}g`) :
		new FloatUnit(`10^${toPower - fromPower} ${fromPrefix}g/${toPrefix}g`))

	const intro = `${type === 1 ? 'De standaard eenheid van massa is de kilogram. Oftewel, we willen' : 'We willen'} van ${fromName}gram naar ${toName}gram gaan.`

	if (fromPower > toPower)
		return <Par>{intro} Een {fromName}gram is <M>{conversion.float.tex}</M> {toName}gram. We gebruiken dus een conversiefactor van <M>{conversion.tex}</M>. Hiermee vinden we een massa van <BM>m = {m.tex} \cdot {conversion.tex} = {correctAnswer.tex}.</BM></Par>
	return <Par>{intro} Een {toName}gram is <M>{conversion.float.tex}</M> {fromName}gram. We gebruiken dus een conversiefactor van <M>{conversion.tex}</M>. Hiermee vinden we een massa van <BM>m = {`\\frac{${m.tex}}{${conversion.tex}}`} = {correctAnswer.tex}.</BM></Par>
}

function getFeedback(exerciseData) {
	return getDefaultFeedback('ans', exerciseData, { text: { unit: getUnitMessage(exerciseData.state.type) } })
}

function getUnitMessage(type, prefix) {
	if (type === 0)
		return 'Je hebt niet kilogram als eenheid gebruikt.'
	if (type === 1)
		return 'Je hebt niet de standaard eenheid van massa gebruikt.'
	if (type === 2)
		return `Je hebt niet ${getPrefixName(prefix)}gram als eenheid gebruikt.`
}