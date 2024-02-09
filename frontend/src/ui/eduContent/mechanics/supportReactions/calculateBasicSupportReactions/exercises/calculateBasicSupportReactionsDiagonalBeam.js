import React from 'react'

import { Vector, Line } from 'step-wise/geometry'

import { Translation, Check } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { Drawing, useScaleBasedTransformationSettings } from 'ui/figures'
import { useInput, InputSpace } from 'ui/form'
import { useCurrentBackgroundColor, FloatUnitInput } from 'ui/inputs'
import { StepExercise, getStep, useSolution, getFieldInputFeedback } from 'ui/eduTools'

import { FBDInput, Group, Beam, HingeSupport, RollerHingeSupport, Distance, Element, Label, LoadLabel, render, getFBDFeedback, loadSources, performLoadsComparison, sumOfForces, sumOfMoments } from 'ui/eduContent/mechanics'

const distanceShift = 60

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { M: Moment, getLoadNames } = useSolution()
	const inputLoads = useInput('loads')
	const loadNames = getLoadNames(inputLoads).filter(load => !load.prenamed)
	return <>
		<Translation>
			<Par>A beam is connected through a hinge on the left and a hinging slider on the right. It is subjected to a moment <M>M = {Moment}</M>.</Par>
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
				<Par>A hinge (left) prevents horizontal and vertical motion, but does allow rotation. This means that there is a horizontal and vertical reaction force, but not a reaction torque. Similarly a hinging slider (right) only prevents motion perpendicular to the surface. This results in a vertical reaction force. This gives us the following diagram.</Par>
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
			const [, vFAx, vFAy, vFC] = loadVariables
			const [, FAx, ,] = loadValues
			return <Translation>
				<Par>
					To find <M>{vFAx}</M> we look at the sum of the forces in the horizontal direction. In this case <M>{vFAy}</M> and <M>{vFC}</M> have no effect. This gives us the equilibrium equation
					<BM>{sumOfForces(false)} {directionIndices[1] ? '' : '-'} {vFAx} = 0.</BM>
					This directly tells us that <M>{vFAx} = {FAx}</M>.
				</Par>
			</Translation>
		},
	},
	{
		Problem: () => {
			const { loadVariables } = useSolution()
			const vFC = loadVariables[3]
			return <>
				<Translation>
					<Par>Calculate the vertical reaction force <M>{vFC}</M>.</Par>
				</Translation>
				<InputSpace>
					<FloatUnitInput id={vFC.name} prelabel={<M>{vFC}=</M>} size="s" />
				</InputSpace>
			</>
		},
		Solution: ({ loadVariables, loadValues, directionIndices, l1, l2, clockwise }) => {
			const [vMoment, vFAx, vFAy, vFC] = loadVariables
			const [Moment, , , FC] = loadValues
			return <Translation>
				<Par>
					To find <M>{vFC}</M> we look at the sum of the moments around point <M>A</M>. In this case <M>{vFAx}</M> and <M>{vFAy}</M> have no effect. This gives us the equilibrium equation
					<BM>{sumOfMoments('A', false)} {clockwise ? '' : '-'} {vMoment} {clockwise === directionIndices[3] ? '-' : '+'} {vFC} \left(l_1 + l_2\right) = 0.</BM>
					The solution follows as
					<BM>{vFC} = {directionIndices[3] ? '' : '-'} \frac({vMoment})(l_1 + l_2) = {directionIndices[3] ? '' : '-'} \frac({Moment.float})({l1.float} + {l2.float}) = {FC}.</BM>
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
		Solution: ({ loadVariables, loadValues, clockwise, directionIndices }) => {
			const [, , vFAy, vFC] = loadVariables
			const [, , FAy,] = loadValues
			return <Translation>
				<Par>
					To find <M>{vFAy}</M> we examine the sum of the forces in the vertical direction. (It's also possible through moments around point <M>C</M> or a point vertically below <M>C</M>, but this is a bit more work.) This gives the equilibrium equation
					<BM>{sumOfForces(true)} {clockwise === directionIndices[2] ? '-' : ''} {vFAy} {clockwise === directionIndices[3] ? '+' : '-'} {vFC} = 0.</BM>
					Solving this for <M>{vFAy}</M> gives
					<BM>{vFAy} = {directionIndices[2] === directionIndices[3] ? '' : '-'} {vFC} = {FAy}.</BM>
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
	const schematics = <Schematics {...solution} loads={loadsToDisplay} showSupports={showSupports} />

	// Set up either a diagram or an input field with said diagram.
	const snappers = [...Object.values(points), Line.fromPoints(points.A, points.C)]
	return isInputField ?
		<FBDInput id="loads" transformationSettings={transformationSettings} snappers={snappers} validate={FBDInput.validation.allConnectedToPoints(points)} getLoadNames={getLoadNames}>{schematics}</FBDInput> :
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
