import React from 'react'

import { Vector } from 'step-wise/geometry'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import { InputSpace } from 'ui/form/FormPart'
import { useInput } from 'ui/form/Form'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { useCurrentBackgroundColor, useScaleAndShiftTransformationSettings } from 'ui/components/figures/Drawing'

import EngineeringDiagram, { Group, Beam, FixedSupport, Distance, PositionedElement, Label, LoadLabel, render } from 'ui/edu/content/mechanics/EngineeringDiagram'
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
	const { P, getLoadNames } = useSolution()
	const inputLoads = useInput('loads')
	const loadNames = getLoadNames(inputLoads).filter(load => !load.prenamed)

	return <>
		<Par>Een balk is aan een muur ingeklemd en belast met een kracht van <M>P = {P}.</M></Par>
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
				<Par>Een inklemming voorkomt alle beweging, en zorgt dus voor een horizontale reactiekracht, een verticale reactiekracht en een reactiemoment. Samen met de externe belasting geeft dit het volgende schema.</Par>
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
			const [, vFAx, vFAy, vMA] = loadVariables
			const [, FAx, ,] = loadValues

			return <>
				<Par>
					Om <M>{vFAx}</M> te vinden bekijken we de som van de krachten in de horizontale richting. In dit geval hebben <M>{vFAy}</M> en <M>{vMA}</M> geen invloed. Dit geeft ons de evenwichtsvergelijking
					<BM>{sumOfForces(false)} P {directionIndices[1] ? '-' : '+'} {vFAx} = 0.</BM>
					De oplossing volgt als
					<BM>{vFAx} = {directionIndices[1] ? '' : '-'} P = {FAx}.</BM>
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
			const { loadVariables, loadValues, directionIndices } = useSolution()
			const [, vFAx, vFAy, vMA] = loadVariables
			const [, , FAy,] = loadValues

			return <>
				<Par>
					Om <M>{vFAy}</M> te vinden bekijken we de som van de krachten in de verticale richting. In dit geval hebben <M>{vFAx}</M> en <M>{vMA}</M> geen invloed. Dit geeft ons de evenwichtsvergelijking
					<BM>{sumOfForces(true)} {directionIndices[2] ? '' : '-'} {vFAy} = 0.</BM>
					Dit vertelt direct dat <M>{vFAy} = {FAy}.</M>
				</Par>
			</>
		},
	},
	{
		Problem: () => {
			const { loadVariables } = useSolution()
			const vMA = loadVariables[3]
			return <>
				<Par>Bereken het reactiemoment <M>{vMA}.</M></Par>
				<InputSpace>
					<FloatUnitInput id={vMA.name} prelabel={<M>{vMA}=</M>} size="s" />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { loadVariables, loadValues, directionIndices, l2 } = useSolution()
			const [, vFAx, vFAy, vMA] = loadVariables
			const [P, , , MA] = loadValues

			return <>
				<Par>
					Om <M>{vMA}</M> te vinden bekijken we de som van de momenten om punt <M>A.</M> In dit geval hebben <M>{vFAx}</M> en <M>{vFAy}</M> geen invloed. Dit geeft ons de evenwichtsvergelijking
					<BM>{sumOfMoments('A', false)} P l_2 {directionIndices[3] ? '-' : '+'} {vMA} = 0.</BM>
					De oplossing volgt als
					<BM>{vMA} = {directionIndices[3] ? '' : '-'} P l_2 = {directionIndices[3] ? '' : '-'} {P.float} \cdot {l2.float} = {MA}.</BM>
					Hiermee zijn alle reactiekrachten/momenten bekend.
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
	const schematics = <Schematics {...solution} showSupports={showSupports} loads={loadsToDisplay} />
	const elements = <Elements {...solution} loads={loadsToDisplay} />

	// Set up either a diagram or an input field with said diagram.
	const snappers = Object.values(points)
	return isInputField ?
		<FBDInput id="loads" transformationSettings={transformationSettings} svgContents={schematics} htmlContents={elements} snappers={snappers} validate={allConnectedToPoints(points)} getLoadNames={getLoadNames} /> :
		<EngineeringDiagram transformationSettings={transformationSettings} svgContents={schematics} htmlContents={elements} />
}

function Schematics({ points, loads, showSupports = true }) {
	return <>
		<Beam points={Object.values(points)} />

		<Group style={{ opacity: showSupports ? 1 : 0.1 }}>
			<FixedSupport position={points.A} angle={Math.PI} />
		</Group>

		<Group>{render(loads)}</Group>

		<Distance span={{ start: points.A, end: points.B }} graphicalShift={new Vector(0, distanceShift)} />
		<Distance span={{ start: points.B, end: points.C }} graphicalShift={new Vector(distanceShift, 0)} />
	</>
}

function Elements({ l1, l2, points, loads, getLoadNames }) {
	const background = useCurrentBackgroundColor()
	const distanceLabelStyle = { background, padding: '0.3rem' }
	const loadNames = getLoadNames(loads)

	return <>
		<Label position={points.A} angle={Math.PI / 4} graphicalDistance={7}><M>A</M></Label>
		<Label position={points.B} angle={Math.PI / 4} graphicalDistance={5}><M>B</M></Label>
		<Label position={points.C} angle={0} graphicalDistance={8}><M>C</M></Label>
		<PositionedElement position={points.A.interpolate(points.B)} graphicalShift={new Vector(0, distanceShift)} anchor={[0.5, 0.5]} style={distanceLabelStyle}><M>l_1 = {l1}</M></PositionedElement>
		<PositionedElement position={points.B.interpolate(points.C)} graphicalShift={new Vector(distanceShift, 0)} rotate={Math.PI / 2} anchor={[0.5, 0.5]} style={distanceLabelStyle}><M>l_2 = {l2}</M></PositionedElement>
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