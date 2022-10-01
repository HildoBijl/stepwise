import React from 'react'

import { numberArray } from 'step-wise/util/arrays'
import { Vector, Rectangle } from 'step-wise/geometry'
import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import { InputSpace } from 'ui/form/FormPart'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'
import { CornerLabel, Circle, Rectangle as SvgRectangle } from 'ui/components/figures'
import { useCurrentBackgroundColor, useScaleAndShiftTransformationSettings } from 'ui/components/figures/Drawing'

import EngineeringDiagram, { Group, Beam, FixedSupport, Distance, PositionedElement, Label, LoadLabel, render } from 'ui/edu/content/mechanics/EngineeringDiagram'
import FBDInput, { allConnectedToPoints, getFBDFeedback, loadSources, performLoadsComparison } from 'ui/edu/content/mechanics/FBDInput'
import { sumOfForces } from 'ui/edu/content/mechanics/latex'

import StepExercise, { getStep } from '../types/StepExercise'
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
		<Par>Een voorwerp wordt belast door vier krachten. Het voorwerp staat stil. De verticale kracht is bekend als <M>F_D = {FD}.</M> De diagonale kracht <M>F_A</M> heeft een hoek van <M>{angle}^\circ</M> ten opzichte van de verticaal. Bereken <M>F_A.</M></Par>
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

function Diagram({ isInputField = false, showSupports = true, showSolution = false }) {
	const transformationSettings = useScaleAndShiftTransformationSettings([Vector.zero, new Vector(4, 4)], { scale: 50, margin: 70 })
	return <EngineeringDiagram transformationSettings={transformationSettings} svgContents={<Schematics />} htmlContents={<Elements />} />
}

function Schematics() {
	const { loads } = useSolution()
	const grid = numberArray(0, 4).map(x => numberArray(0, 4).map(y => new Vector(x, y))).flat()
	const rectangle = new Rectangle({ start: new Vector(-rectangleMargin, -rectangleMargin), end: new Vector(4 + rectangleMargin, 4 + rectangleMargin) })

	return <>
		<SvgRectangle dimensions={rectangle} cornerRadius={0.2} style={{ fill: '#aaccff', strokeWidth: 1, stroke: '#555' }} />
		<Group>{grid.map((point, index) => <Circle key={index} center={point} graphicalRadius={3} />)}</Group>
		<Group>{render(loads)}</Group>
		<Distance span={{ start: new Vector(4, 0), end: new Vector(4, 1) }} graphicalShift={new Vector(distanceShift, 0)} />
	</>
}

function Elements() {
	const { points, loads, loadNames, angle, up } = useSolution()
	const [A, B, C, D] = points
	const diagonalLoad = loads[0]

	return <>
		<PositionedElement position={new Vector(4, 0.5)} graphicalShift={new Vector(distanceShift + 6, 0)} anchor={[0, 0.5]}><M>{new FloatUnit('1 m')}</M></PositionedElement>
		<CornerLabel points={[diagonalLoad.span.start, A, new Vector(A.x, up ? -1 : 5)]} graphicalSize={28}><M>{angle}^\circ</M></CornerLabel>
		{loadNames.map((loadName, index) => <LoadLabel key={index} {...loadName} />)}
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
