import React from 'react'

import { Vector, Line } from 'step-wise/geometry'

import { Translation, Check } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { Drawing, CornerLabel, Line as SvgLine, useScaleBasedTransformationSettings } from 'ui/figures'
import { useInput, InputSpace } from 'ui/form'
import { useCurrentBackgroundColor, FloatUnitInput } from 'ui/inputs'
import { StepExercise, getStep, useSolution, getFieldInputFeedback } from 'ui/eduTools'

import { FBDInput, Group, Beam, HingeSupport, RollerHingeSupport, Distance, Element, Label, LoadLabel, render, getFBDFeedback, loadSources, performLoadsComparison, sumOfForces, sumOfMoments } from 'ui/eduContent/mechanics'

const distanceShift = 60
const angleGraphicalSize = 60

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { P, getLoadNames } = useSolution()
	const inputLoads = useInput('loads')
	const loadNames = getLoadNames(inputLoads).filter(load => !load.prenamed)
	return <>
		<Translation>
			<Par>A beam is connected through a hinge on the left and a hinging slider on the right. It is subjected to a load of <M>P = {P}</M>.</Par>
			<Diagram isInputField={false} />
			<Par>Draw the free body diagram.</Par>
			<InputSpace>
				<Diagram id="loads" isInputField={true} showSupports={false} />
			</InputSpace>
			<Par>Calculate the unknown support reactions.</Par>
		</Translation >
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
				<Par>A hinge (left) prevents horizontal and vertical motion, but does allow rotation. This means that there is a horizontal and vertical reaction force, but not a reaction torque. Similarly a hinging slider (right) only prevents motion perpendicular to the surface. This results, due to the slanted surface, in a rotated reaction force. This gives us the following diagram.</Par>
				<Diagram showSolution={true} showSupports={false} />
				<Par><Check value={hasAdjustedSolution}><Check.True>Note that this is according to the diagram you drew. The support reactions may also be drawn in the opposite direction.</Check.True><Check.False>The directions of the support reactions have been chosen such that the values are positive. They may also be drawn in the opposite direction, but then the calculated support reactions would be negative.</Check.False></Check></Par>
			</Translation>
		},
	},
	{
		Problem: () => {
			const { loadVariables } = useSolution()
			const vFC = loadVariables[3]
			return <>
				<Translation>
					<Par>Calculate the diagonal reaction force <M>{vFC}</M>.</Par>
				</Translation>
				<InputSpace>
					<FloatUnitInput id={vFC.name} prelabel={<M>{vFC}=</M>} size="s" />
				</InputSpace>
			</>
		},
		Solution: ({ directionIndices, l1, l2, angle, P, FCy, FC }) => {
			return <Translation>
				<Par>
					To find <M>F_C</M> we examine the sum of the moments around point <M>A</M>. In this case <M>F_(Ax)</M> and <M>F_(Ay)</M> have no effect. If we decompose <M>F_C</M> into components <M>F_(Cx)</M> and <M>F_(Cy)</M> too, then this gives the equilibrium equation
					<BM>{sumOfMoments('A', false)} P l_1 {directionIndices[3] ? '-' : '+'} F_(Cy) \left(l_1 + l_2\right) = 0.</BM>
					The solution for <M>F_(Cy)</M> follows as
					<BM>F_(Cy) = {directionIndices[3] ? '' : '-'} \frac(P l_1)(l_1 + l_2) = {directionIndices[3] ? '' : '-'} \frac({P.float} \cdot {l1.float})({l1.float} + {l2.float}) = {FCy}.</BM>
					Through decomposing forces <M>F_C</M> follows as
					<BM>F_C = \frac(F_(Cy))(\sin\left({angle}\right)) = \frac({FCy.float})(\sin\left({angle}\right)) = {FC}.</BM>
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
		Solution: ({ directionIndices, P, FCy, FAy }) => {
			return <Translation>
				<Par>
					To find <M>F_(Ay)</M> we look at the sum of the forces in the vertical direction. (This can also be done by examining moments around point <M>C</M>, but this is a bit more work.) This gives the equilibrium equation
					<BM>{sumOfForces(true)} {directionIndices[2] ? '' : '-'} F_(Ay) - P {directionIndices[3] ? '+' : '-'} F_(Cy) = 0.</BM>
					Solving this for <M>F_(Ay)</M> gives
					<BM>F_(Ay) = {directionIndices[2] ? '' : '-'} P {directionIndices[2] === directionIndices[3] ? '-' : '+'} F_(Cy) = {directionIndices[2] ? '' : '-'} {P.float} {directionIndices[2] === directionIndices[3] ? '-' : '+'} {FCy.float.texWithBrackets} = {FAy}.</BM>
				</Par>
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
		Solution: ({ directionIndices, angle, FAx, FC, FCx }) => {
			return <Translation>
				<Par>
					To find <M>F_(Ax)</M> we look at the sum of the forces in the horizontal direction. In this case <M>F_(Ay)</M> and <M>F_(Cy)</M> have no effect. This gives us the equilibrium equation
					<BM>{sumOfForces(false)} {directionIndices[1] ? '' : '-'} F_(Ax) {directionIndices[3] ? '-' : '+'} F_(Cx) = 0.</BM>
					By decomposing forces we can find that
					<BM>F_(Cx) = F_C \sin\left({angle}\right) = {FC.float} \cdot \sin\left({angle}\right) = {FCx}.</BM>
					Solving the equilibrium equation for <M>F_(Ax)</M> then gives
					<BM>F_(Ax) = {directionIndices[1] === directionIndices[3] ? '' : '-'} F_(Cx) = {FAx}.</BM>
					And with this all support reactions have been determined.
				</Par>
			</Translation>
		},
	},
]

function Diagram({ isInputField = false, showSupports = true, showSolution = false }) {
	const solution = useSolution()
	const { points, loads, getLoadNames, angleRad } = solution

	// Define the transformation.
	const transformationSettings = useScaleBasedTransformationSettings(points, { scale: 70, margin: [[100, 120], 100] })

	// Get all the required components.
	const loadsToDisplay = isInputField ? [] : (showSolution ? loads : loads.filter(load => load.source === loadSources.external))
	const schematics = <Schematics {...solution} loads={loadsToDisplay} showSupports={showSupports} />

	// Set up either a diagram or an input field with said diagram.
	const snappers = [...Object.values(points), Line.fromPointAndAngle(points.C, -Math.PI / 2 - angleRad)]
	return isInputField ?
		<FBDInput id="loads" transformationSettings={transformationSettings} snappers={snappers} validate={FBDInput.validation.allConnectedToPoints(points)} getLoadNames={getLoadNames}>{schematics}</FBDInput> :
		<Drawing transformationSettings={transformationSettings}>{schematics}</Drawing>
}

function Schematics({ l1, l2, angle, angleRad, anglePoints, points, loads, getLoadNames, showSupports = true }) {
	const { A, B, C } = points
	const background = useCurrentBackgroundColor()
	const distanceLabelStyle = { background, padding: '0.3rem' }
	const loadNames = getLoadNames(loads)

	return <>
		<Beam points={[A, C]} />
		<Label position={A} angle={-Math.PI * 3 / 4} graphicalDistance={7}><M>A</M></Label>
		<Label position={B} angle={Math.PI / 2} graphicalDistance={4}><M>B</M></Label>
		<Label position={C} angle={-Math.PI / 4} graphicalDistance={8}><M>C</M></Label>

		<Group style={{ opacity: showSupports ? 1 : 0.1 }}>
			<HingeSupport position={A} />
			<RollerHingeSupport position={C} angle={Math.PI / 2 - angleRad} />
		</Group>

		<Group>{render(loads)}</Group>
		{loadNames.map((loadName, index) => <LoadLabel key={index} {...loadName} />)}

		{showSupports ? <>
			<CornerLabel points={anglePoints.map(point => point.add(C))} graphicalSize={28} graphicalPoints={Vector.fromPolar(50, Math.PI / 2 - angleRad)}><M>{angle}^\circ</M></CornerLabel>
			<Group position={C} graphicalPosition={Vector.fromPolar(50, Math.PI / 2 - angleRad)}>
				<SvgLine graphicalPoints={anglePoints.map(point => point.multiply(angleGraphicalSize))} />
			</Group>
		</> : null}

		<Distance span={{ start: A, end: B }} graphicalShift={new Vector(0, distanceShift)} />
		<Element position={A.interpolate(B)} graphicalPosition={new Vector(0, distanceShift)} anchor={[0.5, 0.5]} style={distanceLabelStyle}><M>l_1 = {l1}</M></Element>

		<Distance span={{ start: B, end: C }} graphicalShift={new Vector(0, distanceShift)} />
		<Element position={B.interpolate(C)} graphicalPosition={new Vector(0, distanceShift)} anchor={[0.5, 0.5]} style={distanceLabelStyle}><M>l_2 = {l2}</M></Element>
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
