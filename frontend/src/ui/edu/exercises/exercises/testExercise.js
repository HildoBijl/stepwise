import React from 'react'

import { Vector, Line, PositionedVector } from 'step-wise/geometry'

import { M } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import { InputSpace } from 'ui/form/Status'
import { useCurrentBackgroundColor } from 'ui/components/figures/Drawing'

import EngineeringDiagram, { Group, Beam, HingeSupport, RollerHalfHingeSupport, Distance, PositionedElement, Label, render } from 'ui/edu/content/mechanics/EngineeringDiagram'
import FBDInput, { allConnectedToPoints, getFBDFeedback, loadTypes } from 'ui/edu/content/mechanics/FBDInput'

import { useSolution } from '../ExerciseContainer'
import SimpleExercise from '../types/SimpleExercise'

window.Vector = Vector
window.Line = Line
window.PositionedVector = PositionedVector

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem(state) {
	const solution = useSolution(state)
	const { diagramSettings, points } = solution

	return <>
		<Par>Gegeven is de onderstaande balk met externe belasting.</Par>
		<EngineeringDiagram {...diagramSettings} svgContents={<Schematics data={solution} />} htmlContents={<Elements data={solution} />} />
		<Par>Teken het vrijlichaamschema/schematisch diagram.</Par>
		<InputSpace>
			<FBDInput id="beam" {...diagramSettings} svgContents={<Schematics data={solution} showSupports={false} showLoads={false} />} htmlContents={<Elements data={solution} />} snappers={Object.values(points)} validate={allConnectedToPoints(points)} />
		</InputSpace>
	</>
}

function Schematics({ data, showSupports = true, showLoads = true }) {
	const { points, shift, beam } = data
	return <>
		<Beam points={Object.values(points)} />

		<Group style={{ opacity: showSupports ? 1 : 0.05 }}>
			<HingeSupport position={points.A} />
			<RollerHalfHingeSupport position={points.B} />
		</Group>

		{showLoads ? <Group>
			{render(beam.filter(load => load.source === loadTypes.external))}
		</Group> : null}

		<Distance positionedVector={{ start: points.A.add([0, shift]), end: points.B.add([0, shift]) }} />
		<Distance positionedVector={{ start: points.B.add([0, shift]), end: points.C.add([0, shift]) }} />
		<Distance positionedVector={{ start: points.C.add([shift, 0]), end: points.D.add([shift, 0]) }} />
	</>
}

function Elements({ data }) {
	const { l1, l2, h, points, shift } = data
	const background = useCurrentBackgroundColor()
	return <>
		<Label position={points.A} angle={Math.PI * 5 / 4} distance={5}><M>A</M></Label>
		<Label position={points.B} angle={Math.PI * 3 / 2} distance={2}><M>B</M></Label>
		<Label position={points.C} angle={0}><M>C</M></Label>
		<Label position={points.D} angle={0}><M>D</M></Label>
		<PositionedElement position={points.A.interpolate(points.B).add([0, shift])} anchor={[0.5, 0.5]} scale={1} style={{ background, padding: '0.3rem' }}><M>l_1 = {l1}\ (\rm m)</M></PositionedElement>
		<PositionedElement position={points.B.interpolate(points.C).add([0, shift])} anchor={[0.5, 0.5]} scale={1} style={{ background, padding: '0.3rem' }}><M>l_2 = {l2}\ (\rm m)</M></PositionedElement>
		<PositionedElement position={points.C.interpolate(points.D).add([shift, 0])} anchor={[0.5, 0.5]} scale={1} rotate={Math.PI / 2} style={{ background, padding: '0.3rem' }}><M>h = {h}\ (\rm m)</M></PositionedElement>
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
	return { beam: getFBDFeedback(input.beam, beam, data.equalityOptions, points) }
}