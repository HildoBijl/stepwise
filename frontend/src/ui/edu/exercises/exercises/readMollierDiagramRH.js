import React from 'react'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'

import SimpleExercise from '../types/SimpleExercise'
import { useCorrect } from '../ExerciseContainer'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getAllInputFieldsFeedback} />
}

function Problem({ T, AH }) {
	return <>
		<Par>In een ruimte van <M>{T}</M> is de absolute luchtvochtigheid <M>{AH}.</M> Wat is de relatieve luchtvochtigheid in deze ruimte?</Par>
		<InputSpace>
			<Par>
				<FloatUnitInput id="RH" prelabel={<M>RV =</M>} label="Relatieve luchtvochtigheid" size="s" />
			</Par>
		</InputSpace>
	</>
}

function Solution() {
	const { T, RH, AHmax, AH } = useCorrect()
	return <Par>In het Mollier diagram kunnen we direct bij <M>T = {T}</M> en <M>AV = {AH}</M> opzoeken dat <M>RV = {RH}.</M> Eventueel hadden we als omweg ook op kunnen zoeken dat <BM>AV_(max) = {AHmax}.</BM> Hiermee volgt de relatieve luchtvochtigheid als <BM>RV = \frac(AV)(AV_(max)) = \frac{AH.float}{AHmax.float} = {RH}.</BM></Par>
}