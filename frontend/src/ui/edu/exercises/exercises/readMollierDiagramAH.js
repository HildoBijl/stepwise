import React from 'react'

import { Unit } from 'step-wise/inputTypes/Unit'

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

function Problem({ T, RH }) {
	return <>
		<Par>Buiten is de temperatuur <M>{T}</M> en de relatieve luchtvochtigheid <M>{RH}.</M> Wat is de absolute luchtvochtigheid, in <M>{new Unit('g/kg')}?</M></Par>
		<InputSpace>
			<Par>
				<FloatUnitInput id="AH" prelabel={<M>AV =</M>} label="Absolute luchtvochtigheid" size="s" />
			</Par>
		</InputSpace>
	</>
}

function Solution() {
	const { T, RH, AHmax, AH } = useCorrect()
	return <Par>In het Mollier diagram kunnen we direct bij <M>T = {T}</M> en <M>RV = {RH}</M> opzoeken dat <M>AV = {AH}.</M> Eventueel hadden we als omweg ook op kunnen zoeken dat <BM>AV_(max) = {AHmax}.</BM> Hiermee volgt de absolute luchtvochtigheid als <BM>AV = RV \cdot AV_(max) = {RH.float} \cdot {AHmax.float} = {AH}.</BM></Par>
}