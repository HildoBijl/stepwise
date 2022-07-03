import React from 'react'

import { Vector, Line, PositionedVector } from 'step-wise/geometry'

import { M } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import { InputSpace } from 'ui/form/Status'
import { useCurrentBackgroundColor, useScaleAndShiftTransformationSettings } from 'ui/components/figures/Drawing'

import EngineeringDiagram, { Group, Beam, HingeSupport, RollerHalfHingeSupport, Distance, PositionedElement, Label, render } from 'ui/edu/content/mechanics/EngineeringDiagram'
import FBDInput, { allConnectedToPoints, getFBDFeedback, loadTypes } from 'ui/edu/content/mechanics/FBDInput'

import { useSolution } from '../ExerciseContainer'
import SimpleExercise from '../types/SimpleExercise'

window.Vector = Vector
window.Line = Line
window.PositionedVector = PositionedVector

const distanceShift = 60

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem(state) {
	const solution = useSolution(state)

	return <>
		<Par>Gegeven is de onderstaande balk met externe belasting.</Par>
		<Diagram isInputField={false} {...solution} />
		<Par>Teken het vrijlichaamschema/schematisch diagram.</Par>
		{/* <InputSpace>
			<FBDInput id="loads" {...diagramSettings} svgContents={<Schematics data={solution} showSupports={false} showLoads={false} />} htmlContents={<Elements data={solution} />} snappers={Object.values(points)} validate={allConnectedToPoints(points)} />
		</InputSpace> */}
	</>
}

function Diagram({ isInputField = false, ...solution }) {
	const { points, loads } = solution

	// Define the transformation.
	const transformationSettings = useScaleAndShiftTransformationSettings(points, { scale: 70, margin: [100, [40, 100]] })

	// Get all the required components.
	const schematics = <Schematics {...solution} showSupports={!isInputField} showLoads={!isInputField} />
	const elements = <Elements {...solution} />

	// Set up either a diagram or an input field with said diagram.
	return isInputField ?
		<FBDInput id="loads" transformationSettings={transformationSettings} svgContents={schematics} htmlContents={elements} snappers={Object.values(points)} validate={allConnectedToPoints(points)} maxWidth={bounds => bounds.width} /> :
		<EngineeringDiagram transformationSettings={transformationSettings} svgContents={schematics} htmlContents={elements} maxWidth={bounds => bounds.width} />
}

function Schematics({ points, loads, showSupports = true, showLoads = true }) {
	return <>
		<Beam points={Object.values(points)} />

		<Group style={{ opacity: showSupports ? 1 : 0.05 }}>
			<HingeSupport position={points.A} />
			<RollerHalfHingeSupport position={points.B} />
		</Group>

		{showLoads ? <Group>
			{render(loads.filter(load => load.source === loadTypes.external))}
		</Group> : null}

		<Distance positionedVector={{ start: points.A, end: points.B }} graphicalShift={new Vector(0, distanceShift)} />
		<Distance positionedVector={{ start: points.B, end: points.C }} graphicalShift={new Vector(0, distanceShift)} />
		<Distance positionedVector={{ start: points.C, end: points.D }} graphicalShift={new Vector(distanceShift, 0)} />
	</>
}

function Elements({ points, h, l1, l2 }) {
	const background = useCurrentBackgroundColor()
	const distanceLabelStyle = { background, padding: '0.3rem' }
	return <>
		<Label position={points.A} angle={Math.PI * 5 / 4} graphicalDistance={5}><M>A</M></Label>
		<Label position={points.B} angle={Math.PI * 3 / 2} graphicalDistance={2}><M>B</M></Label>
		<Label position={points.C} angle={0}><M>C</M></Label>
		<Label position={points.D} angle={0}><M>D</M></Label>
		<PositionedElement position={points.A.interpolate(points.B)} graphicalShift={new Vector(0, distanceShift)} anchor={[0.5, 0.5]} style={distanceLabelStyle}><M>l_1 = {l1}\ (\rm m)</M></PositionedElement>
		<PositionedElement position={points.B.interpolate(points.C)} graphicalShift={new Vector(0, distanceShift)} anchor={[0.5, 0.5]} style={distanceLabelStyle}><M>l_2 = {l2}\ (\rm m)</M></PositionedElement>
		<PositionedElement position={points.C.interpolate(points.D)} graphicalShift={new Vector(distanceShift, 0)} anchor={[0.5, 0.5]} rotate={Math.PI / 2} style={distanceLabelStyle}><M>h = {h}\ (\rm m)</M></PositionedElement>
	</>
}

function Solution(state) {
	const solution = useSolution(state)
	const { diagramSettings, beam } = solution

	const Solution = <>
		<Schematics data={solution} showSupports={false} />
		<Group>{render(beam.filter(load => load.source !== loadTypes.external))}</Group>
	</>

	return <>
		<Par>Aan de linkerkant zit een vast scharnier. Een vast scharnier kan horizontale en verticale reactiekrachten geven. Halverwege zit een rollend scharnier. Deze kan alleen reactiekrachten geven loodrecht op het oppervlak. Samen met de externe belastingen geeft dat het volgende vrijlichaamschema.</Par>
		<EngineeringDiagram {...diagramSettings} svgContents={Solution} htmlContents={<Elements data={solution} />} />
	</>
}

function getFeedback({ state, input, progress, shared }) {
	const { getSolution, data } = shared
	const solution = getSolution(state)
	const { beam, points } = solution
	return { beam: getFBDFeedback(input.beam, beam, data.comparison, points) }
}