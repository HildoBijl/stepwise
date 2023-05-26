import React from 'react'

import { numberArray } from 'step-wise/util/arrays'
import { Vector, Rectangle } from 'step-wise/geometry'
import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'

import { Par, M, BM } from 'ui/components'
import { CornerLabel, Circle, Rectangle as SvgRectangle, Line, useScaleAndShiftTransformationSettings } from 'ui/components/figures'
import { InputSpace } from 'ui/form/FormPart'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'

import EngineeringDiagram, { Group, Distance, Element, LoadLabel, render } from 'ui/edu/content/mechanics/EngineeringDiagram'
import { sumOfForces } from 'ui/edu/content/mechanics/latex'

import StepExercise from '../types/StepExercise'
import { useSolution } from '../util/SolutionProvider'
import { getInputFieldFeedback, getMCFeedback } from '../util/feedback'

const distanceShift = 60
const rectangleMargin = 0.7

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { angle, FD } = useSolution()

	return <>
		<Par>Een voorwerp wordt volgens onderstaande wijze met vier krachten belast. Het voorwerp staat stil. De verticale kracht (rood) heeft een grootte van <M>F_D = {FD}.</M> De diagonale kracht <M>F_A</M> (geel) heeft een hoek van <M>{angle}^\circ</M> ten opzichte van de verticaal. Bereken <M>F_A.</M></Par>
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
					<FloatUnitInput id="FAy" prelabel={<M>F_(Ay)=</M>} size="s" />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { FAy, up } = useSolution()
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

function Diagram({ decompose = false }) {
	const transformationSettings = useScaleAndShiftTransformationSettings([Vector.zero, new Vector(4, 4)], { scale: 50, margin: 70 })
	return <EngineeringDiagram transformationSettings={transformationSettings} svgContents={<Schematics decompose={decompose} />} htmlContents={<Elements decompose={decompose} />} />
}

function Schematics({ decompose }) {
	const { loads, decomposedLoads } = useSolution()
	const grid = numberArray(0, 4).map(x => numberArray(0, 4).map(y => new Vector(x, y))).flat()
	const rectangle = new Rectangle({ start: new Vector(-rectangleMargin, -rectangleMargin), end: new Vector(4 + rectangleMargin, 4 + rectangleMargin) })
	const span = loads[0].span
	const lineEndpoint = new Vector(span.end.x, span.start.y)

	return <>
		<SvgRectangle dimensions={rectangle} cornerRadius={0.2} style={{ fill: '#aaccff', strokeWidth: 1, stroke: '#777' }} />
		<Group>{grid.map((point, index) => <Circle key={index} center={point} graphicalRadius={3} style={{ fill: '#777' }} />)}</Group>
		{decompose ? null : <Line points={[span.end, lineEndpoint]} style={{ stroke: '#777' }} />}
		<Group>{render(decompose ? decomposedLoads : loads)}</Group>
		<Distance span={{ start: new Vector(4, 0), end: new Vector(4, 1) }} graphicalShift={new Vector(distanceShift, 0)} />
	</>
}

function Elements({ decompose }) {
	const { loads, loadNames, decomposedLoadNames, angle } = useSolution()
	const span = loads[0].span
	const lineEndpoint = new Vector(span.end.x, span.start.y)

	return <>
		<Element position={new Vector(4, 0.5)} graphicalPosition={new Vector(distanceShift + 6, 0)} anchor={[0, 0.5]}><M>{new FloatUnit('1.0 m')}</M></Element>
		{decompose ? null : <CornerLabel points={[span.start, span.end, lineEndpoint]} graphicalSize={28}><M>{angle}^\circ</M></CornerLabel>}
		{(decompose ? decomposedLoadNames : loadNames).map((loadName, index) => <LoadLabel key={index} {...loadName} />)}
	</>
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
		...getMCFeedback('method', exerciseData, { text: methodText }),
		...getInputFieldFeedback(['FAy', 'FA'], exerciseData),
	}
}
