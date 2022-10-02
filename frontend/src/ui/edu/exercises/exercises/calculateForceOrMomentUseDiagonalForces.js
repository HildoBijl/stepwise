import React from 'react'

import { numberArray } from 'step-wise/util/arrays'
import { Vector, Rectangle } from 'step-wise/geometry'
import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import { InputSpace } from 'ui/form/FormPart'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'
import { Circle, Rectangle as SvgRectangle } from 'ui/components/figures'
import { useScaleAndShiftTransformationSettings } from 'ui/components/figures/Drawing'

import EngineeringDiagram, { Group, Distance, PositionedElement, LoadLabel, render } from 'ui/edu/content/mechanics/EngineeringDiagram'
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
	const { horizontal, FD } = useSolution()

	return <>
		<Par>Een voorwerp wordt volgens onderstaande wijze met vier krachten belast. Het voorwerp staat stil. Alle schuine krachten hebben een hoek van <M>45^\circ</M> ten opzichte van de verticaal. De {horizontal ? 'horizontale' : 'verticale'} kracht (rood) heeft een grootte van <M>F_D = {FD}.</M> Bereken de kracht <M>F_A</M> (geel).</Par>
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
			return <Par>De werklijnen van de krachten <M>F_B</M> en <M>F_C</M> zijn parallel: ze zijn allebei diagonaal onder dezelfde hoek. Deze werklijnen hebben dus geen snijpunt waar we momenten om zouden kunnen nemen. Maar als we alle krachten bekijken loodrecht op deze werklijnen, dan vallen zowel <M>F_B</M> als <M>F_C</M> weg uit de evenwichtsvergelijking. Deze richting is toevallig ook de richting waar <M>F_A</M> in staat. We bekijken dus het krachtenevenwicht in de richting van <M>F_A.</M></Par>
		},
	},
	{
		Problem: () => {
			return <>
				<Par>Bereken via de ontbinding in componenten de component <M>F_(Dl)</M> loodrecht op de werklijnen van <M>F_B</M> en <M>F_C.</M> (De parallelle componenten <M>F_(Dp)</M> is niet nodig.)</Par>
				<Diagram decompose={true} />
				<InputSpace>
					<FloatUnitInput id="FDl" prelabel={<M>F_(Dl)=</M>} size="s" />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { FD, FDl } = useSolution()
			return <Par>
				Alle hoeken die hier spelen zijn <M>45^\circ.</M> We kunnen de loodrechte component dus vinden via <M>\sin\left(45\right),</M> via <M>\cos\left(45\right),</M> of via de factor <M>\frac(1)(2)\sqrt(2).</M> Met elk van deze methoden komen we uit op
				<BM>F_(Dl) = F_D \cdot \frac(1)(2)\sqrt(2) = {FD.float} \cdot \frac(1)(2)\sqrt(2) = {FDl}.</BM>
			</Par>
		},
	},
	{
		Problem: () => {
			return <>
				<Par>Pas krachtenevenwicht toe langs de richting van <M>F_A</M> om <M>F_A</M> te berekenen.</Par>
				<InputSpace>
					<FloatUnitInput id="FA" prelabel={<M>F_A=</M>} size="s" />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { up, right, FA } = useSolution()
			return <Par>
				De evenwichtsvergelijking voor krachten in de richting langs <M>F_A</M> is
				<BM>{sumOfForces(up === right, right, true)} F_A - F_(Dl) = 0.</BM>
				De oplossing volgt als
				<BM>F_A = F_(Dl) = {FA}.</BM>
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

	return <>
		<SvgRectangle dimensions={rectangle} cornerRadius={0.2} style={{ fill: '#aaccff', strokeWidth: 1, stroke: '#777' }} />
		<Group>{grid.map((point, index) => <Circle key={index} center={point} graphicalRadius={3} style={{ fill: '#777' }} />)}</Group>
		<Group>{render(decompose ? decomposedLoads : loads)}</Group>
		<Distance span={{ start: new Vector(4, 0), end: new Vector(4, 1) }} graphicalShift={new Vector(distanceShift, 0)} />
	</>
}

function Elements({ decompose }) {
	const { loadNames, decomposedLoadNames } = useSolution()

	return <>
		<PositionedElement position={new Vector(4, 0.5)} graphicalShift={new Vector(distanceShift + 6, 0)} anchor={[0, 0.5]}><M>{new FloatUnit('1 m')}</M></PositionedElement>
		{(decompose ? decomposedLoadNames : loadNames).map((loadName, index) => <LoadLabel key={index} {...loadName} />)}
	</>
}

function getFeedback(exerciseData) {
	const methodText = [
		<>Nee. Zowel kracht <M>F_B</M> als <M>F_C</M> hebben een horizontale component, en ze komen dan dus in je evenwichtsvergelijking voor.</>,
		<>Nee. Zowel kracht <M>F_B</M> als <M>F_C</M> hebben een verticale component, en ze komen dan dus in je evenwichtsvergelijking voor.</>,
		<>Ja! De krachten <M>F_B</M> en <M>F_C</M> zijn parallel. Als we krachten loodrecht op hun werklijn bekijken, dan vallen ze beiden weg.</>,
		<>Nee. Als we momenten nemen om een punt op de werklijn van <M>F_A,</M> dan valt <M>F_A</M> weg uit de evenwichtsvergelijking. Dat is niet handig: we willen deze kracht juist berekenen!</>,
		<>Nee. De krachten <M>F_B</M> en <M>F_C</M> zijn parallel: hun werklijnen hebben dus geen snijpunt.</>,
	]
	// Give full feedback.
	return {
		...getMCFeedback('method', exerciseData, { text: methodText }),
		...getInputFieldFeedback(['FDl', 'FA'], exerciseData),
	}
}
