import React from 'react'

import { Unit } from 'step-wise/inputTypes'

import { useColor } from 'ui/theme'
import { Par, M, BM } from 'ui/components'
import { Line, Circle } from 'ui/figures'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'
import { SimpleExercise, useSolution, getAllInputFieldsFeedback } from 'ui/eduTools'

import MollierDiagram from '../../content/diagrams/MollierDiagram'

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getAllInputFieldsFeedback} />
}

function Problem({ T, RH }) {
	return <>
		<Par>Buiten is de temperatuur <M>{T}</M> en de relatieve luchtvochtigheid <M>{RH}.</M> Wat is de absolute luchtvochtigheid, in <M>{new Unit('g/kg')}?</M></Par>
		<MollierDiagram maxWidth="500" />
		<InputSpace>
			<Par>
				<FloatUnitInput id="AH" prelabel={<M>AV =</M>} label="Absolute luchtvochtigheid" size="s" />
			</Par>
		</InputSpace>
	</>
}

function Solution() {
	const { T, RH, AHmax, AH } = useSolution()
	const color = useColor('primary')
	
	return <>
		<Par>In het Mollier diagram kunnen we direct bij <M>T = {T}</M> en <M>RV = {RH.setUnit('%')}</M> opzoeken dat <M>AV = {AH}.</M></Par>
		<MollierDiagram maxWidth="500">
			<Line points={[[AHmax.number, 0], [AHmax.number, T.number], [0, T.number]]} style={{ stroke: color, strokeDasharray: '4 2' }} />
			<Line points={[[AH.number, 0], [AH.number, T.number]]} style={{ stroke: color, strokeDasharray: '4 2' }} />
			<Circle center={[AHmax.number, T.number]} graphicalRadius={3} style={{ fill: color }} />
			<Circle center={[AH.number, T.number]} graphicalRadius={3} style={{ fill: color }} />
		</MollierDiagram>
		<Par>Eventueel hadden we als omweg ook op kunnen zoeken dat <BM>AV_(max) = {AHmax}.</BM> Hiermee volgt de absolute luchtvochtigheid als <BM>AV = RV \cdot AV_(max) = {RH.float} \cdot {AHmax.float} = {AH}.</BM></Par>
	</>
}
