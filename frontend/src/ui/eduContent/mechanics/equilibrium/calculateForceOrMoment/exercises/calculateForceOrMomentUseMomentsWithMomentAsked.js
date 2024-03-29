import React from 'react'

import { numberArray } from 'step-wise/util'
import { Vector, Rectangle } from 'step-wise/geometry'
import { FloatUnit } from 'step-wise/inputTypes'

import { Par, M, BM, BMList, BMPart } from 'ui/components'
import { Drawing, CornerLabel, Circle, Rectangle as SvgRectangle, Line, useScaleBasedTransformationSettings } from 'ui/figures'
import { InputSpace } from 'ui/form'
import { MultipleChoice, FloatUnitInput } from 'ui/inputs'
import { StepExercise, useSolution, getFieldInputFeedback, getMCFeedback } from 'ui/eduTools'

import { Distance, Element, Label, LoadLabel, render, sumOfMoments } from 'ui/eduContent/mechanics'

const distanceShift = 60
const rectangleMargin = 0.7

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = ({ angle, FD }) => {
	return <>
		<Par>Een voorwerp wordt volgens onderstaande wijze met drie krachten en een moment belast. Het voorwerp staat stil. De diagonale kracht <M>F_D</M> (rood) heeft een hoek van <M>{angle}^\circ</M> ten opzichte van de verticaal, en de grootte is <M>F_D = {FD}.</M> Bereken het moment <M>M_A</M> (geel).</Par>
		<Diagram />
		<InputSpace>
			<FloatUnitInput id="MA" prelabel={<M>M_A=</M>} size="s" />
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
						<>Som van de momenten: om het punt waar het moment <M>M_A</M> uitgeoefend wordt.</>,
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
		Solution: ({ angle, FD, FDx, FDy }) => {
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
				<Par>Definieer punt <M>E</M> als het snijpunt van de werklijnen van krachten <M>F_B</M> en <M>F_C.</M> Pas momentenevenwicht om dit punt toe om <M>M_A</M> te berekenen.</Par>
				<Diagram decompose={true} showIntersection={true} />
				<InputSpace>
					<FloatUnitInput id="MA" prelabel={<M>M_A=</M>} size="s" />
				</InputSpace>
			</>
		},
		Solution: ({ intersection, D, up, right, clockwise, FDx, FDy, rDx, rDy, MA }) => {
			const FAPositive = clockwise
			const FDxPositive = (right === (D.y < intersection.y))
			const FDyPositive = (up === (D.x < intersection.x))

			return <Par>
				Als we momentenevenwicht toepassen om punt <M>E,</M> en met de klok mee als positieve richting gebruiken, dan vinden we
				<BM>{sumOfMoments('E', false)} {clockwise ? '' : '-'} M_A {FDxPositive ? '+' : '-'} r_(Dx) F_(Dx) {FDyPositive ? '+' : '-'} r_(Dy) F_(Dy) = 0.</BM>
				De oplossing volgt als
				<BM>M_A = {FAPositive === FDxPositive ? '-' : ''} r_(Dx) F_(Dx) {FAPositive === FDyPositive ? '-' : '+'} r_(Dy) F_(Dy) = {FAPositive === FDxPositive ? '-' : ''} {rDx.float} \cdot {FDx.float} {FAPositive === FDyPositive ? '-' : '+'} {rDy.float} \cdot {FDy.float} = {MA}.</BM>
				<Par>Hiermee is het gevraagde moment berekend.</Par>
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
		{decompose ? null : <Line points={[span.end, lineEndpoint]} style={{ stroke: '#777' }} />}

		{(decompose ? decomposedLoadNames : loadNames).map((loadName, index) => <LoadLabel key={index} {...loadName} />)}
		{render(decompose ? decomposedLoads : loads)}

		{decompose ? null : <CornerLabel points={[span.start, span.end, lineEndpoint]} graphicalSize={28}><M>{angle}^\circ</M></CornerLabel>}

		{showIntersection ? <>
			<Label position={intersection} angle={Math.PI / 4} graphicalDistance={4}><M>E</M></Label>
			<Circle center={intersection} graphicalRadius={5} style={{ fill: '#000' }} />
		</> : null}

		<Element position={new Vector(4, 0.5)} graphicalPosition={new Vector(distanceShift + 6, 0)} anchor={[0, 0.5]}><M>{new FloatUnit('1.0 m')}</M></Element>
		<Distance span={{ start: new Vector(4, 0), end: new Vector(4, 1) }} graphicalShift={new Vector(distanceShift, 0)} />
	</Drawing>
}

function getFeedback(exerciseData) {
	const methodText = [
		<>Nee. In dit geval komt <M>F_C</M> nog in je evenwichtsvergelijking voor.</>,
		<>Nee. In dit geval komt <M>F_B</M> nog in je evenwichtsvergelijking voor.</>,
		<>Nee. Zowel <M>F_B</M> als <M>F_C</M> hebben componenten in de richting van <M>F_D.</M> Ze vallen hiermee dus niet weg uit de evenwichtsvergelijking.</>,
		<>Nee. Als we dit punt pakken, dan vallen <M>F_B</M> en <M>F_C</M> niet beiden weg uit de momentenvergelijking.</>,
		<>Ja! Als we momenten nemen om dit punt, dan hebben <M>F_B</M> en <M>F_C</M> allebei een arm van nul, en vallen zo weg uit de evenwichtsvergelijking.</>,
	]

	// Give full feedback.
	return {
		...getMCFeedback(exerciseData, { method: { step: 1, text: methodText } }),
		...getFieldInputFeedback(exerciseData, ['FDx', 'FDy', 'MA']),
	}
}
