import React from 'react'

import { deg2rad } from 'step-wise/util/numbers'
import { Vector, Line, PositionedVector } from 'step-wise/geometry'

import { M } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import { InputSpace } from 'ui/form/Status'
import { useCurrentBackgroundColor, useScaleAndShiftTransformationSettings } from 'ui/components/figures/Drawing'

import EngineeringDiagram, { Group, Beam, HingeSupport, RollerHingeSupport, Distance, PositionedElement, Label, render } from 'ui/edu/content/mechanics/EngineeringDiagram'
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
	const { theta, points, loads } = solution

	// Define the transformation.
	const transformationSettings = useScaleAndShiftTransformationSettings(points, { scale: 70, margin: [120, [100, 120]] })

	// Get all the required components.
	const loadsToDisplay = isInputField ? [] : (showSolution ? loads : loads.filter(load => load.source === loadTypes.external))
	const schematics = <Schematics {...solution} showSupports={!isInputField} loads={loadsToDisplay} />
	const elements = <Elements {...solution} />

	// Set up either a diagram or an input field with said diagram.
	const snappers = [...Object.values(points), Line.fromPointAndAngle(points.B, deg2rad(theta))]
	return isInputField ?
		<FBDInput id="loads" transformationSettings={transformationSettings} svgContents={schematics} htmlContents={elements} snappers={snappers} validate={allConnectedToPoints(points)} maxWidth={bounds => bounds.width} /> :
		<EngineeringDiagram transformationSettings={transformationSettings} svgContents={schematics} htmlContents={elements} maxWidth={bounds => bounds.width} />
}

function Schematics({ points, loads, fixA, showSupports = true }) {
	return <>
		<Beam points={Object.values(points)} />

		<Group style={{ opacity: showSupports ? 1 : 0.05 }}>
			<HingeSupport position={points[fixA ? 'A' : 'C']} />
			<RollerHingeSupport position={points[fixA ? 'C' : 'A']} />
		</Group>

		<Group>{render(loads)}</Group>

		<Distance positionedVector={{ start: points.A, end: points.B }} graphicalShift={new Vector(0, distanceShift)} />
		<Distance positionedVector={{ start: points.B, end: points.C }} graphicalShift={new Vector(0, distanceShift)} />
	</>
}

function Elements({ l1, l2, points }) {
	const background = useCurrentBackgroundColor()
	const distanceLabelStyle = { background, padding: '0.3rem' }

	return <>
		<Label position={points.A} angle={-Math.PI * 3 / 4} graphicalDistance={5}><M>A</M></Label>
		<Label position={points.B} angle={Math.PI / 2} graphicalDistance={3}><M>B</M></Label>
		<Label position={points.C} angle={-Math.PI / 4} graphicalDistance={5}><M>C</M></Label>
		<PositionedElement position={points.A.interpolate(points.B)} graphicalShift={new Vector(0, distanceShift)} anchor={[0.5, 0.5]} style={distanceLabelStyle}><M>{l1}\ (\rm m)</M></PositionedElement>
		<PositionedElement position={points.B.interpolate(points.C)} graphicalShift={new Vector(0, distanceShift)} anchor={[0.5, 0.5]} style={distanceLabelStyle}><M>{l2}\ (\rm m)</M></PositionedElement>
	</>
}

function Solution({ fixA }) {
	return <>
		<Par>Aan de linkerkant zit een {fixA ? 'vast' : 'rollend'} scharnier. Deze kan {fixA ? 'horizontale en verticale' : 'alleen verticale'} reactiekrachten geven. Aan de rechterkant zit een {fixA ? 'rollend' : 'vast'} scharnier. Deze kan {fixA ? 'alleen verticale' : 'horizontale en verticale'} reactiekrachten geven. Samen met de externe belasting geeft dat het volgende vrijlichaamsschema.</Par>
		<Diagram showSolution={true} />
	</>
}

function getFeedback({ state, input, shared }) {
	const { getSolution, data } = shared
	const solution = getSolution(state)
	const { loads, points } = solution
	return { loads: getFBDFeedback(input.loads, loads, data.comparison, points) }
}
