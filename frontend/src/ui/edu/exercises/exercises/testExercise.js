import React from 'react'

import { Vector, Line, PositionedVector } from 'step-wise/geometry'

import { M } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import { InputSpace } from 'ui/form/Status'
import { useCurrentBackgroundColor, useScaleAndShiftTransformationSettings } from 'ui/components/figures/Drawing'

import EngineeringDiagram, { Group, Beam, HingeSupport, RollerHalfHingeSupport, Distance, PositionedElement, Label, LoadLabel, render } from 'ui/edu/content/mechanics/EngineeringDiagram'
import FBDInput, { allConnectedToPoints, getFBDFeedback, loadSources, FBDComparison, getLoadNames } from 'ui/edu/content/mechanics/FBDInput'

import { useSolution } from '../ExerciseContainer'
import SimpleExercise from '../types/SimpleExercise'

window.Vector = Vector
window.Line = Line
window.PositionedVector = PositionedVector

const distanceShift = 60

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem() {
	return <>
		<Par>Gegeven is de onderstaande balk met externe belasting.</Par>
		<Diagram isInputField={false} />
		<Par>Teken het vrijlichaamsschema/schematisch diagram.</Par>
		<InputSpace>
			<Diagram isInputField={true} />
		</InputSpace>
	</>
}

function Diagram({ isInputField = false, showSolution = false }) {
	const solution = useSolution()
	const { points, loads, prenamedLoads } = solution

	// Define the transformation.
	const transformationSettings = useScaleAndShiftTransformationSettings(points, { scale: 70, margin: [120, [40, 120]] })

	// Get all the required components.
	const loadsToDisplay = isInputField ? [] : (showSolution ? loads : loads.filter(load => load.source === loadSources.external))
	const schematics = <Schematics {...solution} showSupports={!isInputField} loads={loadsToDisplay} />
	const elements = <Elements {...solution} loads={loadsToDisplay} />

	// Set up either a diagram or an input field with said diagram.
	return isInputField ?
		<FBDInput id="loads" transformationSettings={transformationSettings} svgContents={schematics} htmlContents={elements} snappers={Object.values(points)} validate={allConnectedToPoints(points)} maxWidth={bounds => bounds.width} points={points} prenamedLoads={prenamedLoads} loadComparison={FBDComparison} /> :
		<EngineeringDiagram transformationSettings={transformationSettings} svgContents={schematics} htmlContents={elements} maxWidth={bounds => bounds.width} />
}

function Schematics({ points, loads, showSupports = true }) {
	return <>
		<Beam points={Object.values(points)} />

		<Group style={{ opacity: showSupports ? 1 : 0.05 }}>
			<HingeSupport position={points.A} />
			<RollerHalfHingeSupport position={points.B} />
		</Group>

		<Group>{render(loads)}</Group>

		<Distance positionedVector={{ start: points.A, end: points.B }} graphicalShift={new Vector(0, distanceShift)} />
		<Distance positionedVector={{ start: points.B, end: points.C }} graphicalShift={new Vector(0, distanceShift)} />
		<Distance positionedVector={{ start: points.C, end: points.D }} graphicalShift={new Vector(distanceShift, 0)} />
	</>
}

function Elements({ points, loads, prenamedLoads, h, l1, l2 }) {
	const background = useCurrentBackgroundColor()
	const distanceLabelStyle = { background, padding: '0.3rem' }
	const loadNames = getLoadNames(loads, points, prenamedLoads, FBDComparison)

	return <>
		<Label position={points.A} angle={Math.PI * 5 / 4} graphicalDistance={5}><M>A</M></Label>
		<Label position={points.B} angle={Math.PI * 3 / 2} graphicalDistance={2}><M>B</M></Label>
		<Label position={points.C} angle={0}><M>C</M></Label>
		<Label position={points.D} angle={0}><M>D</M></Label>
		<PositionedElement position={points.A.interpolate(points.B)} graphicalShift={new Vector(0, distanceShift)} anchor={[0.5, 0.5]} style={distanceLabelStyle}><M>l_1 = {l1}\ (\rm m)</M></PositionedElement>
		<PositionedElement position={points.B.interpolate(points.C)} graphicalShift={new Vector(0, distanceShift)} anchor={[0.5, 0.5]} style={distanceLabelStyle}><M>l_2 = {l2}\ (\rm m)</M></PositionedElement>
		<PositionedElement position={points.C.interpolate(points.D)} graphicalShift={new Vector(distanceShift, 0)} anchor={[0.5, 0.5]} rotate={Math.PI / 2} style={distanceLabelStyle}><M>h = {h}\ (\rm m)</M></PositionedElement>
		{loadNames.map((loadName, index) => <LoadLabel key={index} {...loadName} />)}
	</>
}

function Solution() {
	return <>
		<Par>Aan de linkerkant zit een vast scharnier. Een vast scharnier kan horizontale en verticale reactiekrachten geven. Halverwege zit een rollend scharnier. Deze kan alleen reactiekrachten geven loodrecht op het oppervlak. Samen met de externe belastingen geeft dat het volgende vrijlichaamsschema.</Par>
		<Diagram showSolution={true} />
	</>
}

function getFeedback({ state, input, shared }) {
	const { getSolution, data } = shared
	const solution = getSolution(state)
	const { loads, points } = solution
	return { loads: getFBDFeedback(input.loads, loads, data.comparison, points) }
}