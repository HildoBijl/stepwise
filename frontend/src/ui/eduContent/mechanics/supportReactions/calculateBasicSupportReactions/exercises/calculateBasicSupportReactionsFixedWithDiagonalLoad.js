import React from 'react'

import { Vector, Line } from 'step-wise/geometry'

import { Translation, Check } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { Drawing, CornerLabel, useScaleBasedTransformationSettings } from 'ui/figures'
import { useInput, InputSpace } from 'ui/form'
import { useCurrentBackgroundColor, FloatUnitInput } from 'ui/inputs'
import { StepExercise, getStep, useSolution, getFieldInputFeedback } from 'ui/eduTools'

import { FBDInput, Group, Beam, FixedSupport, Distance, Element, Label, LoadLabel, render, getFBDFeedback, loadSources, performLoadsComparison, sumOfForces, sumOfMoments } from 'ui/eduContent/mechanics'

const distanceShift = 60

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { P, angle, getLoadNames } = useSolution()
	const inputLoads = useInput('loads')
	const loadNames = getLoadNames(inputLoads).filter(load => !load.prenamed)
	return <>
		<Translation>
			<Par>A beam is clamped to a wall and subjected to a load of <M>P = {P}</M>. The load is at an angle of <M>{angle}^\circ</M> with respect to the horizontal.</Par>
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
		Solution: ({ loadVariables, directionIndices, angle, P, Px, FAx }) => {
			const [, vFAx, vFAy, vMA] = loadVariables
			return <Translation>
				<Par>
					To find <M>{vFAx}</M> we examine the sum of the forces in the horizontal direction. In this case <M>{vFAy}</M> and <M>{vMA}</M> have no effect. This gives us the equilibrium equation
					<BM>{sumOfForces(false)} P_x {directionIndices[1] ? '-' : '+'} {vFAx} = 0.</BM>
					The horizontal component <M>P_x</M> here equals
					<BM>P_x = P \cos\left({angle}\right) = {P.float} \cdot \cos\left({angle}\right) = {Px}.</BM>
					If we solve the equilibrium equation for <M>{vFAx}</M>, then we get
					<BM>{vFAx} = {directionIndices[1] ? '' : '-'} P_x = {FAx}.</BM>
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
		Solution: ({ loadVariables, directionIndices, angle, P, Py, FAy }) => {
			const [, vFAx, vFAy, vMA] = loadVariables
			return <Translation>
				<Par>
					To find <M>{vFAy}</M> we examine the sum of the forces in the vertical direction. In this case <M>{vFAx}</M> and <M>{vMA}</M> have no effect. This gives us the equilibrium equation
					<BM>{sumOfForces(true)} {directionIndices[2] ? '' : '-'} {vFAy} - P_y = 0.</BM>
					The vertical component <M>P_y</M> here equals
					<BM>P_y = P \sin\left({angle}\right) = {P.float} \cdot \sin\left({angle}\right) = {Py}.</BM>
					If we solve the equilibrium equation for <M>{vFAy}</M>, then we get
					<BM>{vFAy} = {directionIndices[2] ? '' : '-'} P_y = {FAy}.</BM>
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
		Solution: ({ loadVariables, directionIndices, l1, Py, MA }) => {
			const [, vFAx, vFAy, vMA] = loadVariables
			return <Translation>
				<Par>
					To find <M>{vMA}</M> we examine the sum of the moments around point <M>A</M>. In this case <M>{vFAx}</M> and <M>{vFAy}</M> have no effect. This gives us the equilibrium equation
					<BM>{sumOfMoments('A', false)} P_y l_1 {directionIndices[3] ? '-' : '+'} {vMA} = 0.</BM>
					The solution follows as
					<BM>{vMA} = {directionIndices[3] ? '' : '-'} P_y l_1 = {directionIndices[3] ? '' : '-'} {Py.float} \cdot {l1.float} = {MA}.</BM>
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
	const transformationSettings = useScaleBasedTransformationSettings(points, { scale: 70, margin: [[120, 80], [90, 110]] })

	// Get all the required components.
	const loadsToDisplay = isInputField ? [] : (showSolution ? loads : loads.filter(load => load.source === loadSources.external))
	const schematics = <Schematics {...solution} loads={loadsToDisplay} showSupports={showSupports} />

	// Set up either a diagram or an input field with said diagram.
	const snappers = [...Object.values(points), Line.fromPointAndAngle(points.B, angleRad)]
	return isInputField ?
		<FBDInput id="loads" transformationSettings={transformationSettings} snappers={snappers} validate={FBDInput.validation.allConnectedToPoints(points)} getLoadNames={getLoadNames}>{schematics}</FBDInput> :
		<Drawing transformationSettings={transformationSettings}>{schematics}</Drawing>
}

function Schematics({ l1, l2, angle, points, loads, getLoadNames, showSupports = true }) {
	const background = useCurrentBackgroundColor()
	const distanceLabelStyle = { background, padding: '0.3rem' }
	const loadNames = getLoadNames(loads)
	const { A, B, C } = points
	const externalLoad = loads.find(load => load.source === loadSources.external)

	return <>
		<Beam points={[A, C]} />
		<Label position={A} angle={Math.PI / 4} graphicalDistance={7}><M>A</M></Label>
		<Label position={B} angle={Math.PI / 2} graphicalDistance={4}><M>B</M></Label>
		<Label position={C} angle={0} graphicalDistance={6}><M>C</M></Label>

		<Group style={{ opacity: showSupports ? 1 : 0.1 }}>
			<FixedSupport position={points.A} angle={Math.PI} />
		</Group>

		<Group>{render(loads)}</Group>
		{loadNames.map((loadName, index) => <LoadLabel key={index} {...loadName} />)}

		{externalLoad ? <CornerLabel points={[externalLoad.span.start, B, A]} graphicalSize={32}><M>{angle}^\circ</M></CornerLabel> : null}

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
