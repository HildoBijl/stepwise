import React from 'react'

import { numberArray } from 'step-wise/util/arrays'
import { Vector, Rectangle } from 'step-wise/geometry'
import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'

import { Par, M, BM } from 'ui/components'
import { CornerLabel, Circle, Rectangle as SvgRectangle, Line, useScaleAndShiftTransformationSettings } from 'ui/components/figures'
import { InputSpace } from 'ui/form/FormPart'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'
import { Drawing } from 'ui/components/figures'

import { Distance, Element, Label, LoadLabel, render } from 'ui/edu/content/mechanics/EngineeringDiagram'
import { sumOfMoments } from 'ui/edu/content/mechanics/latex'

import StepExercise from '../types/StepExercise'
import { useSolution } from '../util/SolutionProvider'
import { getInputFieldFeedback, getMCFeedback } from '../util/feedback'

const distanceShift = 60
const rectangleMargin = 0.7

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { angle, MD } = useSolution()

	return <>
		<Par>Een voorwerp wordt volgens onderstaande wijze met drie krachten en een moment belast. Het voorwerp staat stil. Het moment (rood) heeft een grootte van <M>M_D = {MD}.</M> De diagonale kracht <M>F_A</M> (geel) heeft een hoek van <M>{angle}^\circ</M> ten opzichte van de verticaal en de diagonale kracht <M>F_C</M> (blauw) staat onder een hoek van <M>45^\circ.</M> Bereken <M>F_A.</M></Par>
		<Diagram />
		<InputSpace>
			<FloatUnitInput id="FA" prelabel={<M>F_A=</M>} size="s" />
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
					<FloatUnitInput id="FAy" prelabel={<M>F_(Ay)=</M>} size="s" />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { clockwise, MD, rAy, FAy } = useSolution()

			return <Par>
				Als we momentenevenwicht toepassen om punt <M>E,</M> en met de klok mee als positieve richting gebruiken, dan vinden we
				<BM>{sumOfMoments('E', false)} {clockwise ? '-' : ''} r_(Ay) F_(Ay) {clockwise ? '+' : '-'} M_D = 0.</BM>
				De oplossing volgt als
				<BM>F_(Ay) = \frac(M_D)(r_(Ay)) = \frac({MD.float})({rAy.float}) = {FAy}.</BM>
				<Par>Hiermee is de gevraagde kracht berekend.</Par>
			</Par>
		},
	},
	{
		Problem: () => {
			return <>
				<Par>Bereken via de ontbinding in componenten de kracht <M>F_A.</M></Par>
				<InputSpace>
					<FloatUnitInput id="FA" prelabel={<M>F_A=</M>} size="s" />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { angle, FAy, FA } = useSolution()
			return <Par>
				De schuine kracht <M>F_A</M> volgt via de aanliggende zijde <M>F_(Ay)</M> als
				<BM>F_A = \frac(F_(Ay))(\cos\left({angle}\right)) = \frac({FAy.float})(\cos\left({angle}\right)) = {FA}.</BM>
				Hiermee is de gevraagde kracht berekend.
			</Par>
		},
	},
]

function Diagram({ decompose = false, showIntersection = false }) {
	const transformationSettings = useScaleAndShiftTransformationSettings([Vector.zero, new Vector(4, 4)], { scale: 50, margin: 70 })

	const { loads, loadNames, decomposedLoads, decomposedLoadNames, angle, intersection } = useSolution()
	const grid = numberArray(0, 4).map(x => numberArray(0, 4).map(y => new Vector(x, y))).flat()
	const rectangle = new Rectangle({ start: new Vector(-rectangleMargin, -rectangleMargin), end: new Vector(4 + rectangleMargin, 4 + rectangleMargin) })
	const span1 = loads[0].span
	const lineEndpoint1 = new Vector(span1.end.x, span1.start.y)
	const span2 = loads[2].span
	const lineEndpoint2 = new Vector(span2.end.x, span2.start.y)


	return <Drawing transformationSettings={transformationSettings}>
		<SvgRectangle dimensions={rectangle} cornerRadius={0.2} style={{ fill: '#aaccff', strokeWidth: 1, stroke: '#777' }} />
		{grid.map((point, index) => <Circle key={index} center={point} graphicalRadius={3} style={{ fill: '#777' }} />)}

		{render(decompose ? decomposedLoads : loads)}
		{(decompose ? decomposedLoadNames : loadNames).map((loadName, index) => <LoadLabel key={index} {...loadName} />)}

		{decompose ? null : <>
			<CornerLabel points={[span1.start, span1.end, lineEndpoint1]} graphicalSize={28}><M>{angle}^\circ</M></CornerLabel>
			<Line points={[span1.end, lineEndpoint1]} style={{ stroke: '#777' }} />
		</>}

		{showIntersection ? <>
			<Label position={intersection} angle={Math.PI / 4} graphicalDistance={4}><M>E</M></Label>
			<Circle center={intersection} graphicalRadius={5} style={{ fill: '#000' }} />
		</> : null}

		<Element position={new Vector(4, 0.5)} graphicalPosition={new Vector(distanceShift + 6, 0)} anchor={[0, 0.5]}><M>{new FloatUnit('1.0 m')}</M></Element>
		<Distance span={{ start: new Vector(4, 0), end: new Vector(4, 1) }} graphicalShift={new Vector(distanceShift, 0)} />

		<CornerLabel points={[span2.start, span2.end, lineEndpoint2]} graphicalSize={28}><M>45^\circ</M></CornerLabel>
		<Line points={[span2.end, lineEndpoint2]} style={{ stroke: '#777' }} />
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
		...getMCFeedback('method', exerciseData, { text: methodText }),
		...getInputFieldFeedback(['FAy', 'FA'], exerciseData),
	}
}
