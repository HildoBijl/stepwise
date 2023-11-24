import React from 'react'

import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'
import { maximumHumidity } from 'step-wise/data/moistureProperties'

import { Par, M } from 'ui/components'
import { useColor } from 'ui/theme'
import { Line, Circle, Curve } from 'ui/figures'
import { InputSpace } from 'ui/form'
import { FloatUnitInput } from 'ui/inputs'

import MollierDiagram from '../../content/diagrams/MollierDiagram'

import { StepExercise } from 'ui/eduTools'
import { useSolution } from 'ui/eduTools'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const Problem = ({ T1, T3, T4, startRH }) => <>
	<Par>Een airconditioning-systeem krijgt lucht met temperatuur <M>{T1}</M> en relatieve luchtvochtigheid <M>{startRH}</M> binnen. De airco koelt deze lucht eerst af tot <M>{T3}</M> en warmt het vervolgens weer op tot <M>{T4}.</M> Bereken de relatieve luchtvochtigheid waarmee de lucht uit deze airco komt.</Par>
	<MollierDiagram maxWidth="500" />
	<InputSpace>
		<Par>
			<FloatUnitInput id="endRH" prelabel={<M>RV_(uit) =</M>} label="Relatieve luchtvochtigheid" size="s" validate={FloatUnitInput.validation.any} />
		</Par>
	</InputSpace>
</>

const linePoints = maximumHumidity.headers[0].map((T, index) => [maximumHumidity.grid[index].number, T.number])

const steps = [
	{
		Problem: () => <>
			<Par>Bepaal de absolute luchtvochtigheid van de instromende lucht.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="startAH" prelabel={<M>AV_(in) =</M>} label="Absolute luchtvochtigheid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { T1, startRH, startAH } = useSolution()
			const color = useColor('primary')

			return <>
				<Par>Bij een temperatuur van <M>{T1}</M> en een relatieve luchtvochtigheid van <M>{startRH.setUnit('%')}</M> kunnen we opzoeken dat de absolute luchtvochtigheid <M>AH_(in) = {startAH}</M> is.</Par>
				<MollierDiagram maxWidth="500">
					<Line points={[[startAH.number, 0], [startAH.number, T1.number], [0, T1.number]]} style={{ stroke: color, strokeDasharray: '4 2' }} />
					<Circle center={[startAH.number, T1.number]} graphicalRadius={3} style={{ fill: color }} />
				</MollierDiagram>
			</>
		},
	},
	{
		Problem: ({ T3 }) => <>
			<Par>De instromende lucht koelt af tot <M>{T3}</M>. Bepaal de absolute luchtvochtigheid van de lucht op dat moment.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="endAH" prelabel={<M>AV_(tussen) =</M>} label="Absolute luchtvochtigheid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { T1, T2, T3, startAH, endAH } = useSolution()
			const color = useColor('primary')

			const point1 = [startAH.number, T1.number]
			const point2 = [startAH.number, T2.number]
			const point3 = [endAH.number, T3.number]
			const points = [point2, ...linePoints.filter(point => point[1] < T2.number && point[1] > T3.number).reverse(), point3]

			return <>
				<Par> Bij het opwarmen / afkoelen van lucht blijft de absolute luchtvochtigheid altijd constant.We gaan vanaf het vorige punt dus verticaal omlaag in het Mollier diagram.</Par>
				<Par>Voordat we de <M>{T3}</M> bereiken komen we echter op de 100% luchtvochtigheidslijn aan. De luchtvochtigheid kan nooit hoger dan 100% worden. Dit betekent dat een deel van de vocht in de lucht gaat condenseren en als druppels naar beneden valt.</Par>
				<Par>Bij het condenseren blijft de relatieve luchtvochtigheid 100%. Als we uiteindelijk de <M>{T3}</M> bereiken, dan kunnen we dus direct de absolute luchtvochtigheid aflezen. Deze is <M>AH_(tussen) = {endAH}.</M> Dit is de hoeveelheid vocht die nog over is in de lucht. De rest is gecondenseerd.</Par>
				<MollierDiagram maxWidth="500">
					<Line points={[point1, point2]} style={{ stroke: color, strokeWidth: 2 }} />
					<Curve points={points} style={{ stroke: color, strokeWidth: 2 }} />
					<Circle center={point1} graphicalRadius={3} style={{ fill: color }} />
					<Circle center={point2} graphicalRadius={3} style={{ fill: color }} />
					<Circle center={point3} graphicalRadius={3} style={{ fill: color }} />
				</MollierDiagram>
			</>
		},
	},
	{
		Problem: ({ T4 }) => <>
			<Par>Vervolgens wordt de lucht opgewarmd tot <M>{T4}.</M> Bepaal de relatieve luchtvochtigheid na afloop.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="endRH" prelabel={<M>RV_(uit) =</M>} label="Relatieve luchtvochtigheid" size="s" validate={FloatUnitInput.validation.any} />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { T1, T2, T3, T4, startAH, endRH, endAH } = useSolution()
			const color = useColor('primary')

			const point1 = [startAH.number, T1.number]
			const point2 = [startAH.number, T2.number]
			const point3 = [endAH.number, T3.number]
			const point4 = [endAH.number, T4.number]
			const points = [point2, ...linePoints.filter(point => point[1] < T2.number && point[1] > T3.number).reverse(), point3]

			return <>
				<Par>Vanaf het vorige punt gaan we recht omhoog, met constante absolute luchtvochtigheid <M>AH = {endAH},</M> tot we de <M>{T4}</M> bereikt hebben. Op dit punt is de relatieve luchtvochtigheid <M>RV_(uit) = {endRH.setUnit('%')}.</M> Dit is de relatieve luchtvochtigheid van de uitstromende lucht.</Par>
				<MollierDiagram maxWidth="500">
					<Line points={[point1, point2]} style={{ stroke: color, strokeWidth: 2 }} />
					<Curve points={points} style={{ stroke: color, strokeWidth: 2 }} />
					<Line points={[point3, point4]} style={{ stroke: color, strokeWidth: 2 }} />
					<Line points={[point4, [0, point4[1]]]} style={{ stroke: color, strokeDasharray: '4 2' }} />
					<Circle center={point1} graphicalRadius={3} style={{ fill: color }} />
					<Circle center={point2} graphicalRadius={3} style={{ fill: color }} />
					<Circle center={point3} graphicalRadius={3} style={{ fill: color }} />
					<Circle center={point4} graphicalRadius={3} style={{ fill: color }} />
				</MollierDiagram>
				<Par>Over het algemeen wordt een relatieve luchtvochtigheid tussen de grofweg <M>{new FloatUnit('45%')}</M> en <M>{new FloatUnit('60%')}</M> als comfortabel beschouwd, dus deze airco lijkt goed afgesteld te zijn.</Par>
			</>
		},
	},
]
