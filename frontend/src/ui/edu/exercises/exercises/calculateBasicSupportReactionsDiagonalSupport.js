import React from 'react'

import { Vector, Line } from 'step-wise/geometry'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import { InputSpace } from 'ui/form/FormPart'
import { useInput } from 'ui/form/Form'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { CornerLabel, Line as SvgLine } from 'ui/components/figures'
import { useCurrentBackgroundColor, useScaleAndShiftTransformationSettings } from 'ui/components/figures/Drawing'

import EngineeringDiagram, { Group, Beam, HingeSupport, RollerHingeSupport, Distance, PositionedElement, Label, LoadLabel, render } from 'ui/edu/content/mechanics/EngineeringDiagram'
import FBDInput, { allConnectedToPoints, getFBDFeedback, loadSources, performLoadsComparison } from 'ui/edu/content/mechanics/FBDInput'
import { sumOfForces, sumOfMoments } from 'ui/edu/content/mechanics/latex'

import StepExercise, { getStep } from '../types/StepExercise'
import { useSolution } from '../util/SolutionProvider'
import { getInputFieldFeedback } from '../util/feedback'

const distanceShift = 60
const angleGraphicalSize = 60

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { P, getLoadNames } = useSolution()
	const inputLoads = useInput('loads')
	const loadNames = getLoadNames(inputLoads).filter(load => !load.prenamed)

	return <>
		<Par>Een balk is links met een scharnier en rechts met een scharnierende schuifverbinding bevestigd. Hij wordt belast met een kracht van <M>P = {P}.</M></Par>
		<Diagram isInputField={false} />
		<Par>Teken het vrijlichaamsschema/schematisch diagram.</Par>
		<InputSpace>
			<Diagram id="loads" isInputField={true} showSupports={false} />
		</InputSpace>
		<Par>Bereken hierin de onbekende reactiekrachten/momenten.</Par>
		<InputSpace>
			{loadNames.map(loadName => <FloatUnitInput key={loadName.variable.name} id={loadName.variable.name} prelabel={<M>{loadName.variable}=</M>} size="s" />)}
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			return <>
				<Par>Teken het vrijlichaamsschema/schematisch diagram.</Par>
				<InputSpace>
					<Diagram id="loads" isInputField={true} showSupports={false} />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { hasAdjustedSolution } = useSolution()
			return <>
				<Par>Een scharnier (links) voorkomt horizontale en verticale beweging, maar laat wel draaiing toe. Er is dus een horizontale en een verticale reactiekracht, maar geen reactiemoment. Soortgelijk voorkomt een scharnierende schuifverbinding (rechts) alleen beweging loodrecht op het contactoppervlak. Dat zorgt hier, vanwege de schuine ondergrond, dus voor een iets gekantelde reactiekracht. Zo vinden we het onderstaande schema.</Par>
				<Diagram showSolution={true} showSupports={false} />
				<Par>{hasAdjustedSolution ? <>Merk op dat dit conform jouw getekende diagram is. De reactiekrachten/momenten mogen ook andersom, indien gewenst.</> : <>De richtingen van de reactiekrachten/momenten zijn zo gekozen dat de waarden positief worden. Ze mogen ook de andere kant op getekend worden, maar dan worden de berekende krachten/momenten negatief.</>}</Par>
			</>
		},
	},
	{
		Problem: () => {
			const { loadVariables } = useSolution()
			const vFC = loadVariables[3]
			return <>
				<Par>Bereken de schuine reactiekracht <M>{vFC}.</M></Par>
				<InputSpace>
					<FloatUnitInput id={vFC.name} prelabel={<M>{vFC}=</M>} size="s" />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { directionIndices, l1, l2, angle, P, FCy, FC } = useSolution()

			return <>
				<Par>
					Om <M>F_C</M> te vinden bekijken we de som van de momenten om punt <M>A.</M> In dit geval hebben <M>F_(Ax)</M> en <M>F_(Ay)</M> geen invloed. Als we <M>F_C</M> ook ontbinden in componenten <M>F_(Cx)</M> en <M>F_(Cy)</M>, dan geeft dit de evenwichtsvergelijking
					<BM>{sumOfMoments('A', false)} P l_1 {directionIndices[3] ? '-' : '+'} F_(Cy) \left(l_1 + l_2\right) = 0.</BM>
					De oplossing voor <M>F_(Cy)</M> volgt als
					<BM>F_(Cy) = {directionIndices[3] ? '' : '-'} \frac(P l_1)(l_1 + l_2) = {directionIndices[3] ? '' : '-'} \frac({P.float} \cdot {l1.float})({l1.float} + {l2.float}) = {FCy}.</BM>
					Via het ontbinden van krachten volgt <M>F_C</M> als
					<BM>F_C = \frac(F_(Cy))(\sin\left({angle}\right)) = \frac({FCy.float})(\sin\left({angle}\right)) = {FC}.</BM>
				</Par>
			</>
		},
	},
	{
		Problem: () => {
			const { loadVariables } = useSolution()
			const vFAy = loadVariables[2]
			return <>
				<Par>Bereken de verticale reactiekracht <M>{vFAy}.</M></Par>
				<InputSpace>
					<FloatUnitInput id={vFAy.name} prelabel={<M>{vFAy}=</M>} size="s" />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { directionIndices, P, FCy, FAy } = useSolution()

			return <>
				<Par>
					Om <M>F_(Ay)</M> te vinden bekijken we de som van de krachten in de verticale richting. (Het kan eventueel ook via momenten om punt <M>C,</M> maar dit is iets meer werk.) De evenwichtsvergelijking wordt hiermee
					<BM>{sumOfForces(true)} {directionIndices[2] ? '' : '-'} F_(Ay) - P {directionIndices[3] ? '+' : '-'} F_(Cy) = 0.</BM>
					Dit oplossen voor <M>F_(Ay)</M> geeft
					<BM>F_(Ay) = {directionIndices[2] ? '' : '-'} P {directionIndices[2] === directionIndices[3] ? '-' : '+'} F_(Cy) = {directionIndices[2] ? '' : '-'} {P.float} {directionIndices[2] === directionIndices[3] ? '-' : '+'} {FCy.float.texWithBrackets} = {FAy}.</BM>
				</Par>
			</>
		},
	},
	{
		Problem: () => {
			const { loadVariables } = useSolution()
			const vFAx = loadVariables[1]
			return <>
				<Par>Bereken de horizontale reactiekracht <M>{vFAx}.</M></Par>
				<InputSpace>
					<FloatUnitInput id={vFAx.name} prelabel={<M>{vFAx}=</M>} size="s" />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { directionIndices, angle, FAx, FC, FCx } = useSolution()

			return <>
				<Par>
					Om <M>F_(Ax)</M> te vinden bekijken we de som van de krachten in de horizontale richting. In dit geval hebben <M>F_(Ay)</M> en <M>F_(Cy)</M> geen invloed. Dit geeft ons de evenwichtsvergelijking
					<BM>{sumOfForces(false)} {directionIndices[1] ? '' : '-'} F_(Ax) {directionIndices[3] ? '-' : '+'} F_(Cx) = 0.</BM>
					Via het ontbinden van factoren kunnen we vinden dat
					<BM>F_(Cx) = F_C \sin\left({angle}\right) = {FC.float} \cdot \sin\left({angle}\right) = {FCx}.</BM>
					De evenwichtsvergelijking oplossen voor <M>F_(Ax)</M> geeft vervolgens
					<BM>F_(Ax) = {directionIndices[1] === directionIndices[3] ? '' : '-'} F_(Cx) = {FAx}.</BM>
					Hiermee zijn alle reactiekrachten bekend.
				</Par>
			</>
		},
	},
]

function Diagram({ isInputField = false, showSupports = true, showSolution = false }) {
	const solution = useSolution()
	const { points, loads, getLoadNames, angleRad } = solution

	// Define the transformation.
	const transformationSettings = useScaleAndShiftTransformationSettings(points, { scale: 70, margin: [[100, 120], 100] })

	// Get all the required components.
	const loadsToDisplay = isInputField ? [] : (showSolution ? loads : loads.filter(load => load.source === loadSources.external))
	const schematics = <Schematics {...solution} showSupports={showSupports} loads={loadsToDisplay} />
	const elements = <Elements {...solution} showSupports={showSupports} loads={loadsToDisplay} />

	// Set up either a diagram or an input field with said diagram.
	const snappers = [...Object.values(points), Line.fromPointAndAngle(points.C, -Math.PI / 2 - angleRad)]
	return isInputField ?
		<FBDInput id="loads" transformationSettings={transformationSettings} svgContents={schematics} htmlContents={elements} snappers={snappers} validate={allConnectedToPoints(points)} getLoadNames={getLoadNames} /> :
		<EngineeringDiagram transformationSettings={transformationSettings} svgContents={schematics} htmlContents={elements} />
}

function Schematics({ points, angleRad, anglePoints, loads, showSupports = true }) {
	const { A, B, C } = points

	return <>
		<Beam points={[A, C]} />

		<Group style={{ opacity: showSupports ? 1 : 0.1 }}>
			<HingeSupport position={A} />
			<RollerHingeSupport position={C} angle={Math.PI / 2 - angleRad} />
		</Group>

		<Group>{render(loads)}</Group>

		{showSupports ? <Group position={C} graphicalShift={Vector.fromPolar(50, Math.PI / 2 - angleRad)}>
			<SvgLine graphicalPoints={anglePoints.map(point => point.multiply(angleGraphicalSize))} />
		</Group> : null}
		<Distance span={{ start: A, end: B }} graphicalShift={new Vector(0, distanceShift)} />
		<Distance span={{ start: B, end: C }} graphicalShift={new Vector(0, distanceShift)} />
	</>
}

function Elements({ l1, l2, angle, angleRad, anglePoints, points, loads, getLoadNames, showSupports }) {
	const { A, B, C } = points
	const background = useCurrentBackgroundColor()
	const distanceLabelStyle = { background, padding: '0.3rem' }
	const loadNames = getLoadNames(loads)

	return <>
		<Label position={A} angle={-Math.PI * 3 / 4} graphicalDistance={7}><M>A</M></Label>
		<Label position={B} angle={Math.PI / 2} graphicalDistance={4}><M>B</M></Label>
		<Label position={C} angle={-Math.PI / 4} graphicalDistance={8}><M>C</M></Label>
		<PositionedElement position={A.interpolate(B)} graphicalShift={new Vector(0, distanceShift)} anchor={[0.5, 0.5]} style={distanceLabelStyle}><M>l_1 = {l1}</M></PositionedElement>
		<PositionedElement position={B.interpolate(C)} graphicalShift={new Vector(0, distanceShift)} anchor={[0.5, 0.5]} style={distanceLabelStyle}><M>l_2 = {l2}</M></PositionedElement>
		{showSupports ? <CornerLabel points={anglePoints.map(point => point.add(C))} graphicalSize={28} graphicalShift={Vector.fromPolar(50, Math.PI / 2 - angleRad)}><M>{angle}^\circ</M></CornerLabel> : null}
		{loadNames.map((loadName, index) => <LoadLabel key={index} {...loadName} />)}
	</>
}

function getFeedback(exerciseData) {
	const { input, progress, solution, shared } = exerciseData
	const { loads, points, loadsToCheck } = solution

	// On an incorrect FBD on the main problem, only give feedback on the FBD.
	const step = getStep(progress)
	const loadsFeedback = input.loads && getFBDFeedback(input.loads, loads, shared.data.comparison.loads, points)
	if (step === 0 && !performLoadsComparison('loads', input, solution, shared.data.comparison))
		return { loads: loadsFeedback }

	// Give full feedback.
	return {
		loads: loadsFeedback,
		...getInputFieldFeedback(loadsToCheck, exerciseData)
	}
}
