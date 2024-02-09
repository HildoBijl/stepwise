import React from 'react'

import { Vector } from 'step-wise/geometry'

import { Translation, Check } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { Drawing, useScaleBasedTransformationSettings } from 'ui/figures'
import { useInput, InputSpace } from 'ui/form'
import { useCurrentBackgroundColor, FloatUnitInput } from 'ui/inputs'
import { StepExercise, getStep, useSolution, getFieldInputFeedback } from 'ui/eduTools'

import { FBDInput, Group, Beam, FixedSupport, Distance, Element, Label, LoadLabel, render, getFBDFeedback, loadSources, performLoadsComparison, sumOfForces, sumOfMoments } from 'ui/eduContent/mechanics'

const distanceShift = 60

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { P, getLoadNames } = useSolution()
	const inputLoads = useInput('loads')
	const loadNames = getLoadNames(inputLoads).filter(load => !load.prenamed)
	return <>
		<Translation>
			<Par>A beam is clamped to a wall and subjected to a load of <M>P = {P}</M>.</Par>
			<Diagram isInputField={false} />
			<Par>Draw the free body diagram.</Par>
			<InputSpace>
				<Diagram id="loads" isInputField={true} showSupports={false} />
			</InputSpace>
			<Par>Calculate the unknown support reactions.</Par>
		</Translation>
		<InputSpace>
			{loadNames.map(loadName => <FloatUnitInput key={loadName.variable.name} id={loadName.variable.name} prelabel={<M>{loadName.variable}=</M>} size="s" persistent={true} feedbackCoupling={['loads']} />)}
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			return <>
				<Translation>
					<Par>Draw the free body diagram.</Par>
				</Translation>
				<InputSpace>
					<Diagram id="loads" isInputField={true} showSupports={false} />
				</InputSpace>
			</>
		},
		Solution: ({ hasAdjustedSolution }) => {
			return <Translation>
				<Par>A clamp prevents all motion, and hence allows for a horizontal reaction force, a vertical reaction force and a reaction torque. Together with the external load, this gives us the following diagram.</Par>
				<Diagram showSolution={true} showSupports={false} />
				<Par><Check value={hasAdjustedSolution}><Check.True>Note that this is according to the diagram you drew. The support reactions may also be drawn in the opposite direction.</Check.True><Check.False>The directions of the support reactions have been chosen such that the values are positive. They may also be drawn in the opposite direction, but then the calculated support reactions would be negative.</Check.False></Check></Par>
			</Translation>
		},
	},
	{
		Problem: () => {
			const { loadVariables } = useSolution()
			const vFAx = loadVariables[1]
			return <>
				<Translation>
					<Par>Calculate the horizontal reaction force <M>{vFAx}</M>.</Par>
				</Translation>
				<InputSpace>
					<FloatUnitInput id={vFAx.name} prelabel={<M>{vFAx}=</M>} size="s" />
				</InputSpace>
			</>
		},
		Solution: ({ loadVariables, loadValues, directionIndices }) => {
			const [, vFAx, vFAy, vMA] = loadVariables
			const [, FAx, ,] = loadValues
			return <Translation>
				<Par>
					To find <M>{vFAx}</M> we examine the sum of the forces in the horizontal direction. In this case <M>{vFAy}</M> and <M>{vMA}</M> have no effect. This gives us the equilibrium equation
					<BM>{sumOfForces(false)} P {directionIndices[1] ? '-' : '+'} {vFAx} = 0.</BM>
					The solution follows as
					<BM>{vFAx} = {directionIndices[1] ? '' : '-'} P = {FAx}.</BM>
				</Par>
			</Translation>
		},
	},
	{
		Problem: () => {
			const { loadVariables } = useSolution()
			const vFAy = loadVariables[2]
			return <>
				<Translation>
					<Par>Calculate the vertical reaction force <M>{vFAy}</M>.</Par>
				</Translation>
				<InputSpace>
					<FloatUnitInput id={vFAy.name} prelabel={<M>{vFAy}=</M>} size="s" />
				</InputSpace>
			</>
		},
		Solution: ({ loadVariables, loadValues, directionIndices }) => {
			const [, vFAx, vFAy, vMA] = loadVariables
			const [, , FAy,] = loadValues
			return <Translation>
				<Par>
					To find <M>{vFAy}</M> we examine the sum of the forces in the vertical direction. In this case <M>{vFAx}</M> and <M>{vMA}</M> have no effect. This gives us the equilibrium equation
					<BM>{sumOfForces(true)} {directionIndices[2] ? '' : '-'} {vFAy} = 0.</BM>
					This directly tells us that <M>{vFAy} = {FAy}</M>.
				</Par>
			</Translation>
		},
	},
	{
		Problem: () => {
			const { loadVariables } = useSolution()
			const vMA = loadVariables[3]
			return <>
				<Translation>
					<Par>Calculate the reaction torque <M>{vMA}</M>.</Par>
				</Translation>
				<InputSpace>
					<FloatUnitInput id={vMA.name} prelabel={<M>{vMA}=</M>} size="s" />
				</InputSpace>
			</>
		},
		Solution: ({ loadVariables, loadValues, directionIndices, l2 }) => {
			const [, vFAx, vFAy, vMA] = loadVariables
			const [P, , , MA] = loadValues
			return <Translation>
				<Par>
					To find <M>{vMA}</M> we examine the sum of the moments around point <M>A</M>. In this case <M>{vFAx}</M> and <M>{vFAy}</M> have no effect. This gives us the equilibrium equation
					<BM>{sumOfMoments('A', false)} P l_2 {directionIndices[3] ? '-' : '+'} {vMA} = 0.</BM>
					The solution follows as
					<BM>{vMA} = {directionIndices[3] ? '' : '-'} P l_2 = {directionIndices[3] ? '' : '-'} {P.float} \cdot {l2.float} = {MA}.</BM>
					And with this all support reactions have been determined.
				</Par>
			</Translation>
		},
	},
]

function Diagram({ isInputField = false, showSupports = true, showSolution = false }) {
	const solution = useSolution()
	const { points, loads, getLoadNames } = solution

	// Define the transformation.
	const transformationSettings = useScaleBasedTransformationSettings(points, { scale: 70, margin: [100, [60, 100]] })

	// Get all the required components.
	const loadsToDisplay = isInputField ? [] : (showSolution ? loads : loads.filter(load => load.source === loadSources.external))
	const schematics = <Schematics {...solution} showSupports={showSupports} loads={loadsToDisplay} />

	// Set up either a diagram or an input field with said diagram.
	const snappers = Object.values(points)
	return isInputField ?
		<FBDInput id="loads" transformationSettings={transformationSettings} snappers={snappers} validate={FBDInput.validation.allConnectedToPoints(points)} getLoadNames={getLoadNames}>{schematics}</FBDInput> :
		<Drawing transformationSettings={transformationSettings}>{schematics}</Drawing>
}

function Schematics({ l1, l2, points, loads, getLoadNames, showSupports = true }) {
	const background = useCurrentBackgroundColor()
	const distanceLabelStyle = { background, padding: '0.3rem' }
	const loadNames = getLoadNames(loads)

	return <>
		<Beam points={Object.values(points)} />
		<Label position={points.A} angle={Math.PI / 4} graphicalDistance={7}><M>A</M></Label>
		<Label position={points.B} angle={Math.PI / 4} graphicalDistance={5}><M>B</M></Label>
		<Label position={points.C} angle={0} graphicalDistance={8}><M>C</M></Label>

		<Group style={{ opacity: showSupports ? 1 : 0.1 }}>
			<FixedSupport position={points.A} angle={Math.PI} />
		</Group>

		<Group>{render(loads)}</Group>
		{loadNames.map((loadName, index) => <LoadLabel key={index} {...loadName} />)}

		<Distance span={{ start: points.A, end: points.B }} graphicalShift={new Vector(0, distanceShift)} />
		<Element position={points.A.interpolate(points.B)} graphicalPosition={new Vector(0, distanceShift)} anchor={[0.5, 0.5]} style={distanceLabelStyle}><M>l_1 = {l1}</M></Element>

		<Distance span={{ start: points.B, end: points.C }} graphicalShift={new Vector(distanceShift, 0)} />
		<Element position={points.B.interpolate(points.C)} graphicalPosition={new Vector(distanceShift, 0)} rotate={Math.PI / 2} anchor={[0.5, 0.5]} style={distanceLabelStyle}><M>l_2 = {l2}</M></Element>
	</>
}

function getFeedback(exerciseData) {
	const { input, progress, solution } = exerciseData

	// On an incorrect FBD on the main problem, only give feedback on the FBD.
	const loadsFeedback = input.loads && getFBDFeedback(exerciseData, 'loads')
	if (getStep(progress) === 0 && !performLoadsComparison(exerciseData, 'loads'))
		return loadsFeedback

	// Give full feedback.
	return {
		...loadsFeedback,
		...getFieldInputFeedback(exerciseData, solution.loadsToCheck)
	}
}
