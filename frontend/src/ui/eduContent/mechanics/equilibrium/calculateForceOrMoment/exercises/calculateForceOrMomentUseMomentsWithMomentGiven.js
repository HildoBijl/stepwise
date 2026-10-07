import React from 'react'

import { integerRange } from '@step-wise/js-utils'
import { Vector, Rectangle } from '@step-wise/geometry'
import { Quantity } from '@step-wise/physics-core'
import { M, BM } from '@step-wise/math-display'
import { loadNameToVariable } from '@step-wise/mechanics-exercises'
import { Drawing, CornerLabel, Circle, Rectangle as SvgRectangle, Line, DistanceMarker, HtmlElement, Label, anchors } from '@step-wise/drawing'
import { LoadLabel, renderEngineeringDiagram, defaultForceLengthInPixels, defaultEngineeringDiagramColors } from '@step-wise/engineering-diagrams'

import { Par } from 'ui/components'
import { InputSpace } from 'ui/form'
import { MultipleChoice, QuantityInput } from 'ui/inputs'
import { StepExercise, useSolution, getFieldInputFeedback, getMCFeedback } from 'ui/eduTools'

import { sumOfMoments } from 'ui/eduContent/mechanics'

const distanceShift = 60
const rectangleMargin = 0.7

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ angle, MD }) => {
	return <>
		<Par>Een voorwerp wordt volgens onderstaande wijze met drie krachten en een moment belast. Het voorwerp staat stil. Het moment (rood) heeft een grootte van <M>M_D = {MD}.</M> De diagonale kracht <M>F_A</M> (geel) heeft een hoek van <M>{angle}^\circ</M> ten opzichte van de verticaal en de diagonale kracht <M>F_C</M> (blauw) staat onder een hoek van <M>45^\circ.</M> Bereken <M>F_A.</M></Par>
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
						<>Som van de momenten: om het punt waar het moment <M>M_D</M> aangrijpt.</>,
						<>Som van de momenten: om het snijpunt van de werklijnen van <M>F_B</M> en <M>F_C.</M></>,
					]} />
				</InputSpace>
			</>
		},
		Solution: () => {
			return <Par>Als we momenten bekijken om het snijpunt van de werklijnen van <M>F_B</M> en <M>F_C,</M> dan hebben <M>F_B</M> en <M>F_C</M> beiden een arm van nul. Ze vallen daarmee weg uit de evenwichtsvergelijking, wat precies is wat we willen bereiken.</Par>
		},
	},
	{
		Problem: () => {
			return <>
				<Par>Definieer punt <M>E</M> als het snijpunt van de werklijnen van krachten <M>F_B</M> en <M>F_C.</M> Pas momentenevenwicht om dit punt toe om de verticale component <M>F_(Ay)</M> te berekenen.</Par>
				<Diagram decompose={true} showIntersection={true} />
				<InputSpace>
					<QuantityInput id="FAy" prelabel={<M>F_(Ay)=</M>} size="s" />
				</InputSpace>
			</>
		},
		Solution: ({ clockwise, MD, rAy, FAy }) => {

			return <Par>
				Als we momentenevenwicht toepassen om punt <M>E,</M> en met de klok mee als positieve richting gebruiken, dan vinden we
				<BM>{sumOfMoments('E', false)} {clockwise ? '-' : ''} r_(Ay) F_(Ay) {clockwise ? '+' : '-'} M_D = 0.</BM>
				De oplossing volgt als
				<BM>F_(Ay) = \frac(M_D)(r_(Ay)) = \frac({MD.value})({rAy.value}) = {FAy}.</BM>
				<Par>Hiermee is de gevraagde kracht berekend.</Par>
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

function Diagram({ decompose = false, showIntersection = false }) {
	const scale = 50

	const { loads, loadNames, decomposedLoads, decomposedLoadNames, angle, intersection } = useSolution()
	const grid = integerRange(0, 4).map(x => integerRange(0, 4).map(y => new Vector(x, y))).flat()
	const rectangle = new Rectangle({ min: new Vector(-rectangleMargin, -rectangleMargin), max: new Vector(4 + rectangleMargin, 4 + rectangleMargin) })
	const force1 = loads[0]
	const forceStart1 = force1.position.subtract(Vector.fromPolar(force1.relativeMagnitude * defaultForceLengthInPixels / scale, force1.angle))
	const lineEndpoint1 = new Vector(force1.position.x, forceStart1.y)
	const force2 = loads[2]
	const forceStart2 = force2.position.subtract(Vector.fromPolar(force2.relativeMagnitude * defaultForceLengthInPixels / scale, force2.angle))
	const lineEndpoint2 = new Vector(force2.position.x, forceStart2.y)

	return <Drawing view={{ type: 'scale', points: [Vector.zero, new Vector(4, 4)], scale, margin: 70, yDirection: 'up' }}>
		<SvgRectangle corners={[rectangle.min, rectangle.max]} cornerRadius={0.2} fill="#aaccff" stroke="#777" />
		{grid.map((point, index) => <Circle key={index} center={point} fill="#777" radius={{ pixelDistance: 3 }} />)}

		{renderEngineeringDiagram((decompose ? decomposedLoads : loads).map((load, index) => ({
			...load,
			color: decompose
				? (index <= 1 ? defaultEngineeringDiagramColors.input : index === 4 ? defaultEngineeringDiagramColors.external : defaultEngineeringDiagramColors.reaction)
				: (index === 0 ? defaultEngineeringDiagramColors.input : index === 3 ? defaultEngineeringDiagramColors.external : defaultEngineeringDiagramColors.reaction),
		})))}
		{(decompose ? decomposedLoadNames : loadNames).map(({ load, name }, index) => <LoadLabel key={index} load={load}><M>{loadNameToVariable(name)}</M></LoadLabel>)}

		{decompose ? null : <>
			<CornerLabel positions={[forceStart1, force1.position, lineEndpoint1]} size={{ pixelDistance: 28 }}><M>{angle}^\circ</M></CornerLabel>
			<Line positions={[force1.position, lineEndpoint1]} stroke="#777" />
		</>}

		{showIntersection ? <>
			<Label position={intersection} angle={Math.PI / 4} distance={{ pixelDistance: 4 }}><M>E</M></Label>
			<Circle center={intersection} fill="#000" radius={{ pixelDistance: 5 }} />
		</> : null}

		<HtmlElement anchor={anchors.left} position={{ position: new Vector(4, 0.5), pixelOffset: new Vector(distanceShift + 6, 0) }}><M>{new Quantity('1.0 m')}</M></HtmlElement>
		<DistanceMarker pixelOffset={new Vector(distanceShift, 0)} positions={[new Vector(4, 0), new Vector(4, 1)]} />

		<CornerLabel positions={[forceStart2, force2.position, lineEndpoint2]} size={{ pixelDistance: 28 }}><M>45^\circ</M></CornerLabel>
		<Line positions={[force2.position, lineEndpoint2]} stroke="#777" />
	</Drawing>
}

function getFeedback(exerciseData) {
	const methodText = [
		<>Nee. In dit geval komt <M>F_C</M> nog in je evenwichtsvergelijking voor, want deze heeft een horizontale component.</>,
		<>Nee. In dit geval komen <M>F_B</M> en <M>F_C</M> allebei nog in je evenwichtsvergelijking voor.</>,
		<>Nee. Zowel <M>F_B</M> als <M>F_C</M> hebben componenten in de richting van <M>F_A.</M> Ze vallen hiermee dus niet weg uit de evenwichtsvergelijking.</>,
		<>Nee. Als we dit punt pakken, dan vallen <M>F_B</M> en <M>F_C</M> niet beiden weg uit de momentenvergelijking.</>,
		<>Ja! Als we momenten nemen om dit punt, dan hebben <M>F_B</M> en <M>F_C</M> allebei een arm van nul, en vallen zo weg uit de evenwichtsvergelijking.</>,
	]

	// Give full feedback.
	return {
		...getMCFeedback(exerciseData, { method: { step: 1, text: methodText } }),
		...getFieldInputFeedback(exerciseData, ['FAy', 'FA']),
	}
}
