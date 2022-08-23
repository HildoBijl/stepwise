import React, { useRef } from 'react'

import { Unit } from 'step-wise/inputTypes/Unit'
import { maximumHumidity } from 'step-wise/data/moistureProperties'

import { useInitializer } from 'util/react'
import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { InputSpace } from 'ui/form/FormPart'

import MollierDiagram from '../../content/diagrams/MollierDiagram'

import StepExercise from '../types/StepExercise'
import { useSolution } from '../util/SolutionProvider'
import { getAllInputFieldsFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getAllInputFieldsFeedback} />
}

const Problem = ({ T1, startRH, T4, endRH, mdot }) => <>
	<Par>Een grote airconditioning-installatie koelt continu <M>{mdot}</M> lucht met temperatuur <M>{T1}</M> en relatieve luchtvochtigheid <M>{startRH}</M> af tot temperatuur <M>{T4}</M> en relatieve luchtvochtigheid <M>{endRH}.</M> Om dit te kunnen doen koelt de airco eerst de lucht sterk af en warmt het de lucht daarna weer ietsje op. Het gehele proces gebeurt op atmosferische druk. Bereken het koelvermogen waarmee de lucht afgekoeld wordt en het verwarmingsvermogen waarmee de lucht daarna weer opgewarmd wordt.</Par>
	<MollierDiagram maxWidth="500" />
	<InputSpace>
		<Par>
			<FloatUnitInput id="Pcool" prelabel={<M>P_(koel) =</M>} label="Koelvermogen" size="s" positive={true} />
			<FloatUnitInput id="Pheat" prelabel={<M>P_(warm) =</M>} label="Verwarmingsvermogen" size="s" positive={true} />
		</Par>
	</InputSpace>
</>

const color = 'red' // What is the color of the solution lines?
const points = maximumHumidity.headers[0].map((T, index) => ({
	input: maximumHumidity.grid[index].number,
	output: T.number,
}))
const lineStyle = { stroke: color, 'stroke-width': '2' }
const lineStyleDashed = { stroke: color, 'stroke-dasharray': '4, 4' }
const steps = [
	{
		Problem: () => <>
			<Par>Bepaal de temperatuur tot waar de lucht gekoeld wordt.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="T3" prelabel={<M>T_(tussen) =</M>} label="Tussentemperatuur" size="s" />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { T1, T2, T3, T4, startAH, endAH, endRH } = useSolution()
			const plotRef = useRef()
			useInitializer(() => {
				const plot = plotRef.current
				const point1 = {
					input: startAH.number,
					output: T1.number,
				}
				const point2 = {
					input: startAH.number,
					output: T2.number,
				}
				const point3 = {
					input: endAH.number,
					output: T3.number,
				}
				const point4 = {
					input: endAH.number,
					output: T4.number,
				}

				// Start drawing.
				plot.drawLine({
					points: [
						point1,
						point2,
						...points.filter(point => point.output < T2.number && point.output > T3.number).reverse(),
						point3,
						point4,
					],
					style: lineStyle,
				})
				plot.drawLine({
					points: [
						{ input: point3.input, output: 0 },
						point3,
						{ input: 0, output: point3.output },
					],
					style: lineStyleDashed,
				})
				const drawCircle = (point) => plot.drawCircle({ ...point, radius: 4, style: { fill: color } })
				drawCircle(point1)
				drawCircle(point2)
				drawCircle(point3)
				drawCircle(point4)
			})
			return <>
				<Par>De uitstromende lucht heeft een temperatuur van <M>{T4}</M> en een relatieve luchtvochtigheid van <M>{endRH.setUnit('%')}.</M> De absolute luchtvochtigheid hier is dus <M>{endAH}.</M> Om op deze absolute luchtvochtigheid te komen is de lucht hiervoor (op 100% luchtvochtigheid) gekoeld tot <M>T_(tussen) = {T3},</M> af te lezen uit ons Mollier-diagram.</Par>
				<MollierDiagram ref={plotRef} maxWidth="500" />
			</>
		},
	},
	{
		Problem: () => <>
			<Par>Bepaal de warmte per kilogram lucht (in <M>{new Unit('J/kg')}</M> of <M>{new Unit('kJ/kg')}</M>) die bij het afkoelen afgevoerd wordt uit de lucht. Bepaal net zo de warmte per kilogram lucht die bij het opwarmen toegevoerd wordt aan de lucht.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="qcool" prelabel={<M>q_(af) =</M>} label="Afgevoerde warmte" size="s" positive={true} />
					<FloatUnitInput id="qheat" prelabel={<M>q_(toe) =</M>} label="Toegevoerde warmte" size="s" positive={true} />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { T1, T3, T4, cp, qcool, qheat } = useSolution()
			return <Par>Eerst wordt de lucht op constante druk afgekoeld van <M>T_(in) = {T1}</M> tot <M>T_(tussen) = {T3}.</M> De warmte die hierbij uit elke kilogram lucht gehaald moet worden is <BM>q_(af) = c_p \left(T_(in) - T_(tussen)\right) = {cp.float} \cdot \left({T1.float} - {T3.float}\right) = {qcool}.</BM> Vervolgens wordt de lucht op constante druk opgewarmd van <M>T_(tussen) = {T3}</M> tot <M>T_(uit) = {T4}.</M> De warmte die hierbij aan elke kilogram lucht wordt toegevoerd is <BM>q_(toe) = c_p \left(T_(uit) - T_(tussen)\right) = {cp.float} \cdot \left({T4.float} - {T3.float}\right) = {qheat}.</BM></Par>
		},
	},
	{
		Problem: () => <>
			<Par>Bepaal aan de hand van de warmtestromen en de massastroom lucht wat het koelvermogen en het verwarmingsvermogen zijn.</Par>
			<InputSpace>
				<Par>
					<FloatUnitInput id="Pcool" prelabel={<M>P_(koel) =</M>} label="Koelvermogen" size="s" positive={true} />
					<FloatUnitInput id="Pheat" prelabel={<M>P_(warm) =</M>} label="Verwarmingsvermogen" size="s" positive={true} />
				</Par>
			</InputSpace>
		</>,
		Solution: () => {
			const { qcool, qheat, mdot, Pcool, Pheat } = useSolution()
			return <>
				<Par>We weten de hoeveelheid warmte die uit elke kilogram lucht wordt gehaald. Ook weten we hoeveel kilogram lucht er elke seconde langsstroomt. Zo zien we ook hoeveel warmte we elke seconde uit de lucht moeten halen. Dit volgt via <BM>P_(koel) = \dot(m) q_(koel) = {mdot.float} \cdot {qcool.float} = {Pcool}.</BM> Op identieke wijze vinden we ook het verwarmingsvermogen als <BM>P_(warm) = \dot(m) q_(warm) = {mdot.float} \cdot {qheat.float} = {Pheat}.</BM> Deze waarden kunnen indien nodig vervolgens weer gebruikt worden om een schatting te maken van het vermogen van de airco. Dit hangt wel af van de efficiëntie van het koelproces, dus daar gaan we hier verder niet op in.</Par>
			</>
		},
	},
]