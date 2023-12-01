import React from 'react'

import { numberArray } from 'step-wise/util'
import { Vector, Rectangle } from 'step-wise/geometry'
import { FloatUnit } from 'step-wise/inputTypes'

import { Par, M, BM } from 'ui/components'
import { Drawing, CornerLabel, Circle, Rectangle as SvgRectangle, Line, useScaleBasedTransformationSettings } from 'ui/figures'
import { InputSpace } from 'ui/form'
import { MultipleChoice, FloatUnitInput } from 'ui/inputs'
import { StepExercise, useSolution, getInputFieldFeedback, getMCFeedback } from 'ui/eduTools'

import { Distance, Element, LoadLabel, render, sumOfForces } from 'ui/eduContent/mechanics'

const distanceShift = 60
const rectangleMargin = 0.7

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { angle, FD } = useSolution()

	return <>
		<Par>Een voorwerp wordt volgens onderstaande wijze met drie krachten en een moment belast. Het voorwerp staat stil. De diagonale kracht <M>F_D</M> (rood) heeft een hoek van <M>{angle}^\circ</M> ten opzichte van de verticaal, en de grootte is <M>F_D = {FD}.</M> Bereken de horizontale kracht <M>F_A</M> (geel).</Par>
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
				<Par>Bepaal een evenwichtsvergelijking om toe te passen zodat <M>F_B</M> en <M>M_C</M> geen effect hebben.</Par>
				<InputSpace>
					<MultipleChoice id="method" choices={[
						<>Krachtenevenwicht in horizontale richting.</>,
						<>Krachtenevenwicht in verticale richting.</>,
						<>Krachtenevenwicht in diagonale richting: in de richting van <M>F_D</M>.</>,
						<>Som van de momenten: om het punt waar het moment <M>M_C</M> aangrijpt.</>,
						<>Som van de momenten: om het snijpunt van de werklijnen van <M>F_A</M> en <M>F_B.</M></>,
					]} />
				</InputSpace>
			</>
		},
		Solution: () => {
			return <Par>Om het moment <M>M_C</M> geen effect te laten hebben moeten we een krachtenevenwicht toepassen: bij een momentenevenwicht speelt hij immers altijd mee. Om vervolgens ook de kracht <M>F_B</M> geen effect te laten hebben, moeten we krachten loodrecht op <M>F_B</M> bekijken. Omdat <M>F_B</M> verticaal is, bekijken we dus het krachtenevenwicht in horizontale richting.</Par>
		},
	},
	{
		Problem: () => {
			return <>
				<Par>Bereken via de ontbinding in componenten de horizontale component <M>F_(Dx)</M> van <M>F_D.</M></Par>
				<Diagram decompose={true} />
				<InputSpace>
					<FloatUnitInput id="FDx" prelabel={<M>F_(Dx)=</M>} size="s" />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { angle, FD, FDx } = useSolution()
			return <Par>
				De horizontale component <M>F_(Dx)</M> van kracht <M>F_D</M> volgt als overstaande zijde van de hoek van <M>{angle}^\circ</M> als
				<BM>F_(Dx) = F_D \sin\left({angle}\right) = {FD.float} \cdot \sin\left({angle}\right) = {FDx}.</BM>
			</Par>
		},
	},
	{
		Problem: () => {
			return <>
				<Par>Pas krachtenevenwicht in de horizontale richting toe om <M>F_A</M> te berekenen.</Par>
				<InputSpace>
					<FloatUnitInput id="FA" prelabel={<M>F_A=</M>} size="s" />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { right, FA } = useSolution()
			return <Par>
				De evenwichtsvergelijking voor krachten in horizontale richting is
				<BM>{sumOfForces(false)} {right ? '' : '-'} F_A {right ? '-' : '+'} F_(Dx) = 0.</BM>
				De oplossing volgt als
				<BM>F_A = F_(Dx) = {FA}.</BM>
				Hiermee is de gevraagde kracht berekend.
			</Par>
		},
	},
]

function Diagram({ decompose = false }) {
	const transformationSettings = useScaleBasedTransformationSettings([Vector.zero, new Vector(4, 4)], { scale: 50, margin: 70 })

	const { loads, loadNames, decomposedLoads, decomposedLoadNames, angle } = useSolution()
	const grid = numberArray(0, 4).map(x => numberArray(0, 4).map(y => new Vector(x, y))).flat()
	const rectangle = new Rectangle({ start: new Vector(-rectangleMargin, -rectangleMargin), end: new Vector(4 + rectangleMargin, 4 + rectangleMargin) })
	const span = loads[3].span
	const lineEndpoint = new Vector(span.end.x, span.start.y)

	return <Drawing transformationSettings={transformationSettings}>
		<SvgRectangle dimensions={rectangle} cornerRadius={0.2} style={{ fill: '#aaccff', strokeWidth: 1, stroke: '#777' }} />
		{grid.map((point, index) => <Circle key={index} center={point} graphicalRadius={3} style={{ fill: '#777' }} />)}

		{render(decompose ? decomposedLoads : loads)}
		{(decompose ? decomposedLoadNames : loadNames).map((loadName, index) => <LoadLabel key={index} {...loadName} />)}

		<Element position={new Vector(4, 0.5)} graphicalPosition={new Vector(distanceShift + 6, 0)} anchor={[0, 0.5]}><M>{new FloatUnit('1.0 m')}</M></Element>
		<Distance span={{ start: new Vector(4, 0), end: new Vector(4, 1) }} graphicalShift={new Vector(distanceShift, 0)} />

		{decompose ? null : <>
			<CornerLabel points={[span.start, span.end, lineEndpoint]} graphicalSize={28}><M>{angle}^\circ</M></CornerLabel>
			<Line points={[span.end, lineEndpoint]} style={{ stroke: '#777' }} />
		</>}
	</Drawing>
}

function getFeedback(exerciseData) {
	const methodText = [
		<>Ja! Als we krachten in de horizontale richting bekijken, dan valt zowel <M>F_B</M> weg (want geen horizontale component) als <M>M_C</M> (want geen kracht).</>,
		<>Nee. In dit geval komt <M>F_B</M> in je evenwichtsvergelijking voor.</>,
		<>Nee. Als je <M>F_B</M> zou ontbinden langs de richting van <M>F_D,</M> dan heeft het nog steeds een component. De kracht valt daarmee dus niet weg uit de vergelijking.</>,
		<>Nee. Bij een momentenevenwicht heeft <M>M_C</M> een effect, en valt hij dus niet uit de vergelijking. Ook veroorzaakt kracht <M>F_B</M> dan ook nog een moment.</>,
		<>Nee. Als we dit doen, dan valt de kracht <M>F_A</M> weg uit onze vergelijking, terwijl we die juist willen berekenen! Ook valt <M>M_C</M> niet weg, terwijl we die niet hoeven te weten.</>,
	]
	// Give full feedback.
	return {
		...getMCFeedback('method', exerciseData, { text: methodText }),
		...getInputFieldFeedback(['FDx', 'FA'], exerciseData),
	}
}
