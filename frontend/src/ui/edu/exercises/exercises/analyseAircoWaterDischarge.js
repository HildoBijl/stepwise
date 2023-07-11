import React from 'react'

import { Unit } from 'step-wise/inputTypes/Unit'
import { maximumHumidity } from 'step-wise/data/moistureProperties'

import { Par, M, BM } from 'ui/components'
import { useColor } from 'ui/theme'
import { Line, Circle, Curve } from 'ui/figures'
import { InputSpace } from 'ui/form'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'

import MollierDiagram from '../../content/diagrams/MollierDiagram'

import StepExercise from '../types/StepExercise'
import { useSolution } from '../util/SolutionProvider'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const Problem = ({ T1, startRH, T4, endRH }) => <>
	<Par>Een airconditioning-systeem krijgt lucht met temperatuur <M>{T1}</M> en relatieve luchtvochtigheid <M>{startRH}</M> binnen. Hij levert vervolgens lucht met temperatuur <M>{T4}</M> en relatieve luchtvochtigheid <M>{endRH}.</M> Om dit te kunnen doen koelt de airco eerst de lucht af en warmt het de lucht daarna weer ietsje op. Bereken de temperatuur tot waar de airco de lucht afkoelt. Vind ook de hoeveelheid water per kilogram lucht (in <M>{new Unit('g/kg')}</M>) die hierbij condenseert en afgevoerd wordt.</Par>
	<MollierDiagram maxWidth="500" />
	<InputSpace>
		<Par>
			<FloatUnitInput id="T3" prelabel={<M>T_(tussen) =</M>} label="Tussentemperatuur" size="s" />
			<FloatUnitInput id="dAH" prelabel={<M>\frac(m_(water))(m_(lucht)) =</M>} label="Afgevoerde water" size="s" />
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
		Problem: () => <>
			<Par>Bepaal de absolute luchtvochtigheid van de uitstromende lucht.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="endAH" prelabel={<M>AV_(uit) =</M>} label="Absolute luchtvochtigheid" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { T4, endRH, endAH } = useSolution()
			const color = useColor('primary')

			return <>
				<Par>Bij een temperatuur van <M>{T4}</M> en een relatieve luchtvochtigheid van <M>{endRH.setUnit('%')}</M> kunnen we opzoeken dat de absolute luchtvochtigheid <M>AH_(uit) = {endAH}</M> is.</Par>
				<MollierDiagram maxWidth="500">
					<Line points={[[endAH.number, 0], [endAH.number, T4.number], [0, T4.number]]} style={{ stroke: color, strokeDasharray: '4 2' }} />
					<Circle center={[endAH.number, T4.number]} graphicalRadius={3} style={{ fill: color }} />
				</MollierDiagram>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Om op deze absolute luchtvochtigheid <M>AV_(uit)</M> te komen wordt de lucht afgekoeld. Bepaal bij welke temperatuur deze absolute luchtvochtigheid bereikt wordt.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="T3" prelabel={<M>T_(tussen) =</M>} label="Tussentemperatuur" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { T1, T2, T3, T4, startAH, endAH } = useSolution()
			const color = useColor('primary')

			const point1 = [startAH.number, T1.number]
			const point2 = [startAH.number, T2.number]
			const point3 = [endAH.number, T3.number]
			const point4 = [endAH.number, T4.number]
			const points = [point2, ...linePoints.filter(point => point[1] < T2.number && point[1] > T3.number).reverse(), point3]

			return <>
				<Par>We bekijken de gehele cyclus. Bij het opwarmen/afkoelen van lucht blijft de absolute luchtvochtigheid altijd constant. We gaan vanaf het beginpunt dus verticaal omlaag in het Mollier diagram.</Par>
				<Par>Na verloop van tijd bereiken we de 100% luchtvochtigheidslijn. Als we nu nog verder afkoelen (wat we ook doen) dan zal vocht in de lucht condenseren en als druppels naar beneden vallen. Immers, de relatieve luchtvochtigheid kan nooit groter dan 100% worden. De 100% luchtvochtigheidslijn geeft vervolgens aan hoeveel vocht er nog in de lucht overblijft.</Par>
				<MollierDiagram maxWidth="500">
					<Line points={[point1, point2]} style={{ stroke: color, strokeWidth: 2 }} />
					<Curve points={points} style={{ stroke: color, strokeWidth: 2 }} />
					<Line points={[point3, point4]} style={{ stroke: color, strokeWidth: 2 }} />
					<Circle center={point1} graphicalRadius={3} style={{ fill: color }} />
					<Circle center={point2} graphicalRadius={3} style={{ fill: color }} />
					<Circle center={point3} graphicalRadius={3} style={{ fill: color }} />
					<Circle center={point4} graphicalRadius={3} style={{ fill: color }} />
				</MollierDiagram>
				<Par>We weten dat de lucht uiteindelijk een absolute luchtvochtigheid van <M>{endAH}</M> heeft. Als we de 100% luchtvochtigheidslijn volgen tot dit punt, dan zien we dat dit bij een temperatuur van <M>T_(tussen) = {T3}</M> is. De airco koelt de lucht dus tot deze temperatuur.</Par>
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Bepaal hoeveel water per kilogram lucht (in <M>{new Unit('g/kg')}</M>) tijdens het koelen gecondenseerd is.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="dAH" prelabel={<M>\frac(m_(water))(m_(lucht)) =</M>} label="Afgevoerde water" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { startAH, endAH, dAH } = useSolution()
			return <Par>De instromende lucht bevat <M>AH_(in) = {startAH}</M> aan water. De uitstromende lucht bevat <M>AH_(uit) = {endAH}</M> aan water. Dat betekent dat er <BM>\Delta AH = AH_(in) - AH_(uit) = {startAH.float} - {endAH.float} = {dAH}</BM> aan water is "verdwenen". Dit water is gecondenseerd en wordt door de airco afgevoerd.</Par>
		},
	},
]
