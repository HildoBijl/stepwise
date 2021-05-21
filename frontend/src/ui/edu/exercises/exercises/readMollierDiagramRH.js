import React, { useRef } from 'react'

import { useInitializer } from 'util/react'
import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput, { validNumberAndUnit } from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/Status'

import MollierDiagram from '../../content/diagrams/MollierDiagram'

import SimpleExercise from '../types/SimpleExercise'
import { useCorrect } from '../ExerciseContainer'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getAllInputFieldsFeedback} />
}

function Problem({ T, AH }) {
	return <>
		<Par>In een ruimte van <M>{T}</M> is de absolute luchtvochtigheid <M>{AH}.</M> Wat is de relatieve luchtvochtigheid in deze ruimte?</Par>
		<MollierDiagram maxWidth="500" />
		<InputSpace>
			<Par>
				<FloatUnitInput id="RH" prelabel={<M>RV =</M>} label="Relatieve luchtvochtigheid" size="s" validate={validNumberAndUnit} />
			</Par>
		</InputSpace>
	</>
}

function Solution() {
	const { T, RH, AHmax, AH } = useCorrect()
	const plotRef = useRef()
	useInitializer(() => {
		const plot = plotRef.current
		const color = 'red'
		plot.drawLine({
			points: [
				{ input: AHmax.number, output: 0, },
				{ input: AHmax.number, output: T.number, },
				{ input: 0, output: T.number, },
			],
			style: { stroke: color, 'stroke-dasharray': '4, 4' },
		})
		plot.drawCircle({
			input: AHmax.number,
			output: T.number,
			radius: 4,
			style: { fill: color },
		})
		plot.drawLine({
			points: [
				{ input: AH.number, output: 0, },
				{ input: AH.number, output: T.number, },
			],
			style: { stroke: color, 'stroke-dasharray': '4, 4' },
		})
		plot.drawCircle({
			input: AH.number,
			output: T.number,
			radius: 4,
			style: { fill: color },
		})
	})
	return <>
		<Par>In het Mollier diagram kunnen we direct bij <M>T = {T}</M> en <M>AV = {AH}</M> opzoeken dat <M>RV = {RH}.</M></Par>
		<MollierDiagram ref={plotRef} maxWidth="500" />
		<Par>Eventueel hadden we als omweg ook op kunnen zoeken dat <BM>AV_(max) = {AHmax}.</BM> Hiermee volgt de relatieve luchtvochtigheid als <BM>RV = \frac(AV)(AV_(max)) = \frac{AH.float}{AHmax.float} = {RH}.</BM></Par>
	</>
}