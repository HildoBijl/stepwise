import React from 'react'

import { integerRange } from '@step-wise/js-utils'
import { Vector, Rectangle } from '@step-wise/geometry'
import { Quantity } from '@step-wise/physics-core'
import { M, BM } from '@step-wise/math-display'
import { loadNameToVariable } from '@step-wise/mechanics-exercises'
import { Drawing, CornerLabel, Circle, Rectangle as SvgRectangle, Line, DistanceMarker, HtmlElement, anchors } from '@step-wise/drawing'
import { LoadLabel, renderEngineeringDiagram, defaultForceLengthInPixels, defaultEngineeringDiagramColors } from '@step-wise/engineering-diagrams'

import { Par } from 'ui/components'
import { InputSpace } from 'ui/form'
import { MultipleChoice, QuantityInput } from 'ui/inputs'
import { StepExercise, useSolution, getFieldInputFeedback, getMCFeedback } from 'ui/eduTools'

import { sumOfForces } from 'ui/eduContent/mechanics'

const distanceShift = 60
const rectangleMargin = 0.7

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ angle, FD }) => {
	return <>
		<Par>Een voorwerp wordt volgens onderstaande wijze met vier krachten belast. Het voorwerp staat stil. De verticale kracht (rood) heeft een grootte van <M>F_D = {FD}.</M> De diagonale kracht <M>F_A</M> (geel) heeft een hoek van <M>{angle}^\circ</M> ten opzichte van de verticaal. Bereken <M>F_A.</M></Par>
		<Diagram />
		<InputSpace>
			<QuantityInput id="FA" prelabel={<M>F_A=</M>} size="s" />
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			return <>
				<Par>Bepaal een evenwichtsvergelijking om toe te passen zodat <M>F_B</M> en <M>F_C</M> geen effect hebben.</Par>
				<InputSpace>
					<MultipleChoice id="method" choices={[
						<>Krachtenevenwicht in horizontale richting.</>,
						<>Krachtenevenwicht in verticale richting.</>,
						<>Krachtenevenwicht in diagonale richting: in de richting van <M>F_A</M>.</>,
						<>Som van de momenten: om het snijpunt van de werklijnen van <M>F_A</M> en <M>F_D.</M></>,
						<>Som van de momenten: om het snijpunt van de werklijnen van <M>F_B</M> en <M>F_C.</M></>,
					]} />
				</InputSpace>
			</>
		},
		Solution: () => {
			return <Par>Als we krachten in de verticale richting bekijken, dan vallen de horizontale krachten <M>F_B</M> en <M>F_C</M> weg.</Par>
		},
	},
	{
		Problem: () => {
			return <>
				<Par>Pas krachtenevenwicht in de verticale richting toe om de verticale component <M>F_(Ay)</M> te berekenen.</Par>
				<Diagram decompose={true} />
				<InputSpace>
					<QuantityInput id="FAy" prelabel={<M>F_(Ay)=</M>} size="s" />
				</InputSpace>
			</>
		},
		Solution: ({ FAy, up }) => {
			return <Par>
				De evenwichtsvergelijking voor krachten in verticale richting is
				<BM>{sumOfForces(true)} {up ? '-' : ''} F_(Ay) {up ? '+' : '-'} F_D = 0.</BM>
				De oplossing volgt als
				<BM>F_(Ay) = F_D = {FAy}.</BM>
			</Par>
		},
	},
	{
		Problem: () => {
			return <>
				<Par>Bereken via de ontbinding in componenten de kracht <M>F_A.</M></Par>
				<InputSpace>
					<QuantityInput id="FA" prelabel={<M>F_A=</M>} size="s" />
				</InputSpace>
			</>
		},
		Solution: ({ angle, FAy, FA }) => {
			return <Par>
				De schuine kracht <M>F_A</M> volgt via de aanliggende zijde <M>F_(Ay)</M> als
				<BM>F_A = \frac(F_(Ay))(\cos\left({angle}\right)) = \frac({FAy.value})(\cos\left({angle}\right)) = {FA}.</BM>
				Hiermee is de gevraagde kracht berekend.
			</Par>
		},
	},
]

function Diagram({ decompose = false }) {
	const scale = 50

	const { loads, loadNames, decomposedLoads, decomposedLoadNames, angle } = useSolution()
	const grid = integerRange(0, 4).map(x => integerRange(0, 4).map(y => new Vector(x, y))).flat()
	const rectangle = new Rectangle({ min: new Vector(-rectangleMargin, -rectangleMargin), max: new Vector(4 + rectangleMargin, 4 + rectangleMargin) })
	const force = loads[0]
	const forceEndpoint = force.position.subtract(Vector.fromPolar(force.relativeMagnitude * defaultForceLengthInPixels / scale, force.angle))
	const lineEndpoint = new Vector(force.position.x, forceEndpoint.y)

	return <Drawing view={{ type: 'scale', points: [Vector.zero, new Vector(4, 4)], scale, margin: 70, yDirection: 'up' }}>
		<SvgRectangle corners={[rectangle.min, rectangle.max]} cornerRadius={0.2} fill="#aaccff" stroke="#777" />
		{grid.map((point, index) => <Circle key={index} center={point} fill="#777" radius={{ pixelDistance: 3 }} />)}

		{decompose ? null : <>
			<CornerLabel positions={[forceEndpoint, force.position, lineEndpoint]} size={{ pixelDistance: 28 }}><M>{angle}^\circ</M></CornerLabel>
			<Line positions={[force.position, lineEndpoint]} stroke="#777" />
		</>}

		{(decompose ? decomposedLoadNames : loadNames).map(({ load, name }, index) => <LoadLabel key={index} load={load}><M>{loadNameToVariable(name)}</M></LoadLabel>)}
		{renderEngineeringDiagram(decompose ?
			decomposedLoads.map((load, index) => ({ ...load, color: (index <= 1 ? defaultEngineeringDiagramColors.input : index === 4 ? defaultEngineeringDiagramColors.external : defaultEngineeringDiagramColors.reaction) })) :
			loads.map((load, index) => ({ ...load, color: (index === 0 ? defaultEngineeringDiagramColors.input : index === 3 ? defaultEngineeringDiagramColors.external : defaultEngineeringDiagramColors.reaction) }))
		)}

		<HtmlElement anchor={anchors.left} position={{ position: new Vector(4, 0.5), pixelOffset: new Vector(distanceShift + 6, 0) }}><M>{new Quantity('1.0 m')}</M></HtmlElement>
		<DistanceMarker pixelOffset={new Vector(distanceShift, 0)} positions={[new Vector(4, 0), new Vector(4, 1)]} />
	</Drawing>
}

function getFeedback(exerciseData) {
	const methodText = [
		<>Nee. In dit geval komen <M>F_B</M> en <M>F_C</M> in je evenwichtsvergelijking voor.</>,
		<>Ja! Omdat <M>F_B</M> en <M>F_C</M> beiden horizontaal zijn, vallen ze weg als we krachten in verticale richting bekijken.</>,
		<>Nee. Als je <M>F_B</M> en <M>F_C</M> zou ontbinden langs de richting van <M>F_A,</M> dan hebben ze allebei nog steeds een component. Ze vallen dan niet weg.</>,
		<>Nee. Als we momenten nemen om een punt op de werklijn van <M>F_A,</M> dan valt <M>F_A</M> weg uit de evenwichtsvergelijking. Dat is niet handig: we willen deze kracht juist berekenen!</>,
		<>Nee. De krachten <M>F_B</M> en <M>F_C</M> zijn parallel: hun werklijnen zijn allebei horizontale lijnen en hebben dus geen snijpunt.</>,
	]

	// Give full feedback.
	return {
		...getMCFeedback(exerciseData, { method: { step: 1, text: methodText } }),
		...getFieldInputFeedback(exerciseData, ['FAy', 'FA']),
	}
}
