import React from 'react'

import { selectRandomCorrect, selectRandomIncorrect } from 'step-wise/util/random'
import { Vector, Line, PositionedVector } from 'step-wise/CAS/linearAlgebra'

import { M } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import { InputSpace } from 'ui/form/Status'

import EngineeringDiagram, { loadColors, Group, Beam, Force, Moment, HingeSupport, RollerHalfHingeSupport, Distance, PositionedElement } from 'ui/edu/content/mechanics/EngineeringDiagram'
import FBDInput from 'ui/edu/content/mechanics/FBDInput'

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
			<FBDInput id="beam" {...diagramSettings} svgContents={<Schematics data={solution} showSupports={false} showLoads={false} />} htmlContents={<Elements data={solution} />} snappers={Object.values(points)} />
		</InputSpace>
	</>
}

function Schematics({ data, showSupports = true, showLoads = true }) {
	const { points, shift } = data
	return <>
		<Beam points={Object.values(points)} />

		<Group style={{ opacity: showSupports ? 1 : 0.1 }}>
			<HingeSupport position={points.A} />
			<RollerHalfHingeSupport position={points.B} />
		</Group>

		<Group style={{ opacity: showLoads ? 1 : 0.1 }}>
			<Moment position={points.C} color={loadColors.external} opening={Math.PI} />
			<Force positionedVector={{ vector: [80, 0], end: points.D }} color={loadColors.external} />
		</Group>

		<Distance positionedVector={{ start: points.A.add([0, shift]), end: points.B.add([0, shift]) }} />
		<Distance positionedVector={{ start: points.B.add([0, shift]), end: points.C.add([0, shift]) }} />
		<Distance positionedVector={{ start: points.C.add([shift, 0]), end: points.D.add([shift, 0]) }} />
	</>
}

function Elements({ data }) {
	const { l1, l2, h, points, shift } = data
	return <>
		<PositionedElement position={points.A.interpolate(points.B).add([0, shift])} anchor={[0.5, 1]} scale={1} ><M>l_1 = {l1}\ (\rm m)</M></PositionedElement>
		<PositionedElement position={points.B.interpolate(points.C).add([0, shift])} anchor={[0.5, 1]} scale={1}><M>l_2 = {l2}\ (\rm m)</M></PositionedElement>
		<PositionedElement position={points.C.interpolate(points.D).add([shift, 0])} anchor={[0.5, 1]} scale={1} rotate={Math.PI / 2}><M>h = {h}\ (\rm m)</M></PositionedElement>
	</>
}

function Solution(state) {
	const solution = useSolution(state)
	const { diagramSettings, points } = solution

	const Solution = <>
		<Schematics data={solution} showSupports={false} />
		<Group>
			<Force positionedVector={{ vector: [80, 0], end: points.A }} color={loadColors.reaction} />
			<Force positionedVector={{ vector: [0, -80], end: points.A }} color={loadColors.reaction} />
			<Force positionedVector={{ vector: [0, -80], end: points.B }} color={loadColors.reaction} />
		</Group>
	</>

	return <>
		<Par>Aan de linkerkant zit een vast scharnier. Een vast scharnier kan horizontale en verticale reactiekrachten geven. Halverwege zit een rollend scharnier. Deze kan alleen reactiekrachten geven loodrecht op het oppervlak. Samen met de externe belastingen geeft dat het volgende vrijlichaamschema.</Par>
		<EngineeringDiagram {...diagramSettings} svgContents={Solution} htmlContents={<Elements data={solution} />} />
	</>
}

function getFeedback({ state, input, progress }) {
	// const { } = state
	// const { ans } = input
	const correct = progress.solved || false
	if (correct)
		return { beam: { correct, text: selectRandomCorrect() } }
	return { beam: { correct, text: selectRandomIncorrect() } }
}