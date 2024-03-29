import React from 'react'

import { useColor } from 'ui/theme'
import { Par, M, BM } from 'ui/components'
import { Line, Circle } from 'ui/figures'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { SimpleExercise } from 'ui/eduTools'

import { MollierDiagram } from 'ui/eduContent/physics/thermodynamics/humidity'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} />
}

function Problem({ T, AH }) {
	return <>
		<Par>In een ruimte van <M>{T}</M> is de absolute luchtvochtigheid <M>{AH}.</M> Wat is de relatieve luchtvochtigheid in deze ruimte?</Par>
		<MollierDiagram maxWidth="500" />
		<InputSpace>
			<Par>
				<FloatUnitInput id="RH" prelabel={<M>RV =</M>} label="Relatieve luchtvochtigheid" size="s" validate={FloatUnitInput.validation.any} />
			</Par>
		</InputSpace>
	</>
}

function Solution({ T, RH, AHmax, AH }) {
	const color = useColor('primary')
	return <>
		<Par>In het Mollier diagram kunnen we direct bij <M>T = {T}</M> en <M>AV = {AH}</M> opzoeken dat <M>RV = {RH}.</M></Par>
		<MollierDiagram maxWidth="500">
			<Line points={[[AHmax.number, 0], [AHmax.number, T.number], [0, T.number]]} style={{ stroke: color, strokeDasharray: '4 2' }} />
			<Line points={[[AH.number, 0], [AH.number, T.number]]} style={{ stroke: color, strokeDasharray: '4 2' }} />
			<Circle center={[AHmax.number, T.number]} graphicalRadius={3} style={{ fill: color }} />
			<Circle center={[AH.number, T.number]} graphicalRadius={3} style={{ fill: color }} />
		</MollierDiagram>
		<Par>Eventueel hadden we als omweg ook op kunnen zoeken dat <BM>AV_(max) = {AHmax}.</BM> Hiermee volgt de relatieve luchtvochtigheid als <BM>RV = \frac(AV)(AV_(max)) = \frac{AH.float}{AHmax.float} = {RH}.</BM></Par>
	</>
}
