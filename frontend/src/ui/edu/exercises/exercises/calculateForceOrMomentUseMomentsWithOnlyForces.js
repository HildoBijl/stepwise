import React from 'react'

import { numberArray } from 'step-wise/util/arrays'
import { Vector, Rectangle } from 'step-wise/geometry'
import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'

import { Par, M, BM, BMList, BMPart } from 'ui/components'
import { Drawing, CornerLabel, Circle, Rectangle as SvgRectangle, Line, useScaleBasedTransformationSettings } from 'ui/figures'
import { InputSpace } from 'ui/form'
import { MultipleChoice } from 'ui/inputs'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'

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
	const { angle, horizontal, FD } = useSolution()

	return <>
		<Par>Een voorwerp wordt volgens onderstaande wijze met vier krachten belast. Het voorwerp staat stil. De diagonale kracht <M>F_D</M> (rood) heeft een hoek van <M>{angle}^\circ</M> ten opzichte van de verticaal, en de grootte is <M>F_D = {FD}.</M> Bereken de {horizontal ? 'horizontale' : 'verticale'} kracht <M>F_A</M> (geel).</Par>
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
						<>Krachtenevenwicht in diagonale richting: in de richting van <M>F_D</M>.</>,
						<>Som van de momenten: om het snijpunt van de werklijnen van <M>F_A</M> en <M>F_D.</M></>,
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
				<Par>Ontbind de kracht <M>F_D</M> in de componenten <M>F_(Dx)</M> en <M>F_(Dy).</M></Par>
				<Diagram decompose={true} />
				<InputSpace>
					<FloatUnitInput id="FDx" prelabel={<M>F_(Dx)=</M>} size="s" />
					<FloatUnitInput id="FDy" prelabel={<M>F_(Dy)=</M>} size="s" />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { angle, FD, FDx, FDy } = useSolution()
			return <Par>
				De gevraagde componenten volgen via
				<BMList>
					<BMPart>F_(Dx) = F_D \sin\left({angle}\right) = {FD.float} \cdot \sin\left({angle}\right) = {FDx}.</BMPart>
					<BMPart>F_(Dy) = F_D \cos\left({angle}\right) = {FD.float} \cdot \cos\left({angle}\right) = {FDy}.</BMPart>
				</BMList>
			</Par>
		},
	},
	{
		Problem: () => {
			return <>
				<Par>Definieer punt <M>E</M> als het snijpunt van de werklijnen van krachten <M>F_B</M> en <M>F_C.</M> Pas momentenevenwicht om dit punt toe om <M>F_A</M> te berekenen.</Par>
				<Diagram decompose={true} showIntersection={true} />
				<InputSpace>
					<FloatUnitInput id="FA" prelabel={<M>F_A=</M>} size="s" />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { intersection, A, D, up, right, horizontal, isFAInPositiveDirection, FDx, FDy, rDx, rDy, rA, FA } = useSolution()
			const FAPositive = (isFAInPositiveDirection === (horizontal ? (A.y < intersection.y) : (A.x < intersection.x)))
			const FDxPositive = (right === (D.y < intersection.y))
			const FDyPositive = (up === (D.x < intersection.x))

			return <Par>
				Als we momentenevenwicht toepassen om punt <M>E,</M> en met de klok mee als positieve richting gebruiken, dan vinden we
				<BM>{sumOfMoments('E', false)} {FAPositive ? '' : '-'} r_A F_A {FDxPositive ? '+' : '-'} r_(Dx) F_(Dx) {FDyPositive ? '+' : '-'} r_(Dy) F_(Dy) = 0.</BM>
				De oplossing volgt als
				<BM>F_A = \frac({FAPositive === FDxPositive ? '-' : ''} r_(Dx) F_(Dx) {FAPositive === FDyPositive ? '-' : '+'} r_(Dy) F_(Dy))(r_A) = \frac({FAPositive === FDxPositive ? '-' : ''} {rDx.float} \cdot {FDx.float} {FAPositive === FDyPositive ? '-' : '+'} {rDy.float} \cdot {FDy.float})({rA.float}) = {FA}.</BM>
				<Par>Hiermee is de gevraagde kracht berekend.</Par>
			</Par>
		},
	},
]

function Diagram({ decompose = false, showIntersection = false }) {
	const transformationSettings = useScaleBasedTransformationSettings([Vector.zero, new Vector(4, 4)], { scale: 50, margin: 70 })

	const { loads, loadNames, decomposedLoads, decomposedLoadNames, angle, intersection } = useSolution()
	const grid = numberArray(0, 4).map(x => numberArray(0, 4).map(y => new Vector(x, y))).flat()
	const rectangle = new Rectangle({ start: new Vector(-rectangleMargin, -rectangleMargin), end: new Vector(4 + rectangleMargin, 4 + rectangleMargin) })
	const span = loads[3].span
	const lineEndpoint = new Vector(span.end.x, span.start.y)

	return <Drawing transformationSettings={transformationSettings}>
		<SvgRectangle dimensions={rectangle} cornerRadius={0.2} style={{ fill: '#aaccff', strokeWidth: 1, stroke: '#777' }} />
		{grid.map((point, index) => <Circle key={index} center={point} graphicalRadius={3} style={{ fill: '#777' }} />)}

		{decompose ? null : <CornerLabel points={[span.start, span.end, lineEndpoint]} graphicalSize={28}><M>{angle}^\circ</M></CornerLabel>}
		{decompose ? null : <Line points={[span.end, lineEndpoint]} style={{ stroke: '#777' }} />}

		{(decompose ? decomposedLoadNames : loadNames).map((loadName, index) => <LoadLabel key={index} {...loadName} />)}
		{render(decompose ? decomposedLoads : loads)}

		<Element position={new Vector(4, 0.5)} graphicalPosition={new Vector(distanceShift + 6, 0)} anchor={[0, 0.5]}><M>{new FloatUnit('1.0 m')}</M></Element>
		<Distance span={{ start: new Vector(4, 0), end: new Vector(4, 1) }} graphicalShift={new Vector(distanceShift, 0)} />

		{showIntersection ? <>
			<Circle center={intersection} graphicalRadius={5} style={{ fill: '#000' }} />
			<Label position={intersection} angle={Math.PI / 4} graphicalDistance={4}><M>E</M></Label>
		</> : null}
	</Drawing>
}

function getFeedback(exerciseData) {
	const methodText = [
		<>Nee. In dit geval komt <M>F_C</M> nog in je evenwichtsvergelijking voor.</>,
		<>Nee. In dit geval komt <M>F_B</M> nog in je evenwichtsvergelijking voor.</>,
		<>Nee. Zowel <M>F_B</M> als <M>F_C</M> hebben componenten in de richting van <M>F_D.</M> Ze vallen hiermee dus niet weg uit de evenwichtsvergelijking.</>,
		<>Nee. Als we momenten nemen om een punt op de werklijn van <M>F_A,</M> dan valt <M>F_A</M> weg uit de evenwichtsvergelijking. Dat is niet handig: we willen deze kracht juist berekenen!</>,
		<>Ja! Als we momenten nemen om dit punt, dan hebben <M>F_B</M> en <M>F_C</M> allebei een arm van nul, en vallen zo weg uit de evenwichtsvergelijking.</>,
	]
	// Give full feedback.
	return {
		...getMCFeedback('method', exerciseData, { text: methodText }),
		...getInputFieldFeedback(['FDx', 'FDy', 'FA'], exerciseData),
	}
}
