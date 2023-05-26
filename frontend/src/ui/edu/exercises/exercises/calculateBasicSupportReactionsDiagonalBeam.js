import React from 'react'

import { Vector, Line } from 'step-wise/geometry'

import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form/FormPart'
import { useInput } from 'ui/form/Form'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { useCurrentBackgroundColor, useScaleAndShiftTransformationSettings } from 'ui/components/figures/Drawing'
import { Drawing } from 'ui/components/figures'

import { Group, Beam, HingeSupport, RollerHingeSupport, Distance, Element, Label, LoadLabel, render } from 'ui/edu/content/mechanics/EngineeringDiagram'
import FBDInput, { allConnectedToPoints, getFBDFeedback, loadSources, performLoadsComparison } from 'ui/edu/content/mechanics/FBDInput'
import { sumOfForces, sumOfMoments } from 'ui/edu/content/mechanics/latex'

import StepExercise, { getStep } from '../types/StepExercise'
import { useSolution } from '../util/SolutionProvider'
import { getInputFieldFeedback } from '../util/feedback'

const distanceShift = 60

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { M: Moment, getLoadNames } = useSolution()
	const inputLoads = useInput('loads')
	const loadNames = getLoadNames(inputLoads).filter(load => !load.prenamed)

	return <>
		<Par>Een balk is links met een scharnier en rechts met een scharnierende schuifverbinding bevestigd. Hij wordt belast met een moment van <M>M = {Moment}.</M></Par>
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
				<Par>Een scharnier (links) voorkomt horizontale en verticale beweging, maar laat wel draaiing toe. Er is dus een horizontale en een verticale reactiekracht, maar geen reactiemoment. Soortgelijk voorkomt een scharnierende schuifverbinding alleen beweging loodrecht op het contactoppervlak. Dat zorgt hier dus voor een verticale reactiekracht. Zo vinden we het onderstaande schema.</Par>
				<Diagram showSolution={true} showSupports={false} />
				<Par>{hasAdjustedSolution ? <>Merk op dat dit conform jouw getekende diagram is. De reactiekrachten/momenten mogen ook andersom, indien gewenst.</> : <>De richtingen van de reactiekrachten/momenten zijn zo gekozen dat de waarden positief worden. Ze mogen ook de andere kant op getekend worden, maar dan worden de berekende krachten/momenten negatief.</>}</Par>
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
			const { loadVariables, loadValues, directionIndices } = useSolution()
			const [, vFAx, vFAy, vFC] = loadVariables
			const [, FAx, ,] = loadValues

			return <>
				<Par>
					Om <M>{vFAx}</M> te vinden bekijken we de som van de krachten in de horizontale richting. In dit geval hebben <M>{vFAy}</M> en <M>{vFC}</M> geen invloed. Dit geeft ons de evenwichtsvergelijking
					<BM>{sumOfForces(false)} {directionIndices[1] ? '' : '-'} {vFAx} = 0.</BM>
					Dit vertelt direct dat <M>{vFAx} = {FAx}.</M>
				</Par>
			</>
		},
	},
	{
		Problem: () => {
			const { loadVariables } = useSolution()
			const vFC = loadVariables[3]
			return <>
				<Par>Bereken de verticale reactiekracht <M>{vFC}.</M></Par>
				<InputSpace>
					<FloatUnitInput id={vFC.name} prelabel={<M>{vFC}=</M>} size="s" />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { loadVariables, loadValues, directionIndices, l1, l2, clockwise } = useSolution()
			const [vMoment, vFAx, vFAy, vFC] = loadVariables
			const [Moment, , , FC] = loadValues

			return <>
				<Par>
					Om <M>{vFC}</M> te vinden bekijken we de som van de momenten om punt <M>A.</M> In dit geval hebben <M>{vFAx}</M> en <M>{vFAy}</M> geen invloed. Dit geeft ons de evenwichtsvergelijking
					<BM>{sumOfMoments('A', false)} {clockwise ? '' : '-'} {vMoment} {clockwise === directionIndices[3] ? '-' : '+'} {vFC} \left(l_1 + l_2\right) = 0.</BM>
					De oplossing volgt als
					<BM>{vFC} = {directionIndices[3] ? '' : '-'} \frac({vMoment})(\left(l_1 + l_2\right)) = {directionIndices[3] ? '' : '-'} \frac({Moment.float})(\left({l1.float} + {l2.float}\right)) = {FC}.</BM>
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
			const { loadVariables, loadValues, clockwise, directionIndices } = useSolution()
			const [, , vFAy, vFC] = loadVariables
			const [, , FAy,] = loadValues

			return <>
				<Par>
					Om <M>{vFAy}</M> te vinden bekijken we de som van de krachten in de verticale richting. (Het kan eventueel ook via momenten om punt <M>C</M> of om een punt verticaal onder <M>C,</M> maar dit is iets meer werk.) De evenwichtsvergelijking wordt hiermee
					<BM>{sumOfForces(true)} {clockwise === directionIndices[2] ? '-' : ''} {vFAy} {clockwise === directionIndices[3] ? '+' : '-'} {vFC} = 0.</BM>
					Dit oplossen voor <M>{vFAy}</M> geeft
					<BM>{vFAy} = {directionIndices[2] === directionIndices[3] ? '' : '-'} {vFC} = {FAy}.</BM>
					Hiermee zijn alle reactiekrachten bekend.
				</Par>
			</>
		},
	},
]

function Diagram({ isInputField = false, showSupports = true, showSolution = false }) {
	const solution = useSolution()
	const { points, loads, getLoadNames } = solution

	// Define the transformation.
	const transformationSettings = useScaleAndShiftTransformationSettings(points, { scale: 70, margin: [100, [60, 100]] })

	// Get all the required components.
	const loadsToDisplay = isInputField ? [] : (showSolution ? loads : loads.filter(load => load.source === loadSources.external))
	const schematics = <Schematics {...solution} loads={loadsToDisplay} showSupports={showSupports} />

	// Set up either a diagram or an input field with said diagram.
	const snappers = [...Object.values(points), Line.fromPoints(points.A, points.C)]
	return isInputField ?
		<FBDInput id="loads" transformationSettings={transformationSettings} snappers={snappers} validate={allConnectedToPoints(points)} getLoadNames={getLoadNames}>{schematics}</FBDInput> :
		<Drawing transformationSettings={transformationSettings}>{schematics}</Drawing>
}

function Schematics({ l1, l2, l3, clockwise, angle, points, Bx, Cx, loads, getLoadNames, showSupports = true }) {
	const { A, B, C } = points
	const background = useCurrentBackgroundColor()
	const distanceLabelStyle = { background, padding: '0.3rem' }
	const loadNames = getLoadNames(loads)

	return <>
		<Beam points={[A, C]} />
		<Label position={A} angle={-Math.PI * 3 / 4} graphicalDistance={7}><M>A</M></Label>
		<Label position={B} angle={-angle + (clockwise ? 1 : -1) * Math.PI / 2} graphicalDistance={2}><M>B</M></Label>
		<Label position={C} angle={-Math.PI / 4} graphicalDistance={8}><M>C</M></Label>

		<Group style={{ opacity: showSupports ? 1 : 0.1 }}>
			<HingeSupport position={A} />
			<RollerHingeSupport position={C} />
		</Group>

		<Group>{render(loads)}</Group>
		{loadNames.map((loadName, index) => <LoadLabel key={index} {...loadName} />)}

		<Distance span={{ start: A, end: Bx }} graphicalShift={new Vector(0, distanceShift)} />
		<Element position={A.interpolate(Bx)} graphicalPosition={new Vector(0, distanceShift)} anchor={[0.5, 0.5]} style={distanceLabelStyle}><M>l_1 = {l1}</M></Element>

		<Distance span={{ start: Bx, end: Cx }} graphicalShift={new Vector(0, distanceShift)} />
		<Element position={Bx.interpolate(Cx)} graphicalPosition={new Vector(0, distanceShift)} anchor={[0.5, 0.5]} style={distanceLabelStyle}><M>l_2 = {l2}</M></Element>

		<Distance span={{ start: Cx, end: C }} graphicalShift={new Vector(distanceShift, 0)} />
		<Element position={Cx.interpolate(C)} graphicalPosition={new Vector(distanceShift, 0)} rotate={Math.PI / 2} anchor={[0.5, 0.5]} style={distanceLabelStyle}><M>l_3 = {l3}</M></Element>
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
