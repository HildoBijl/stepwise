import React from 'react'

import { M } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import { InputSpace } from 'ui/form/Status'

import SimpleExercise from '../types/SimpleExercise'

import EngineeringDiagram, { Group, Beam, Force, Moment, RollerSupport, HingeSupport, Hinge, Distance, PositionedElement } from 'ui/edu/content/mechanics/EngineeringDiagram'
import FBDInput from 'ui/edu/content/mechanics/FBDInput'

import { Vector, Line, PositionedVector } from 'step-wise/CAS/linearAlgebra'

window.Vector = Vector
window.Line = Line
window.PositionedVector = PositionedVector

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

const diagramSettings = {
	maxWidth: 600,
	width: 800,
	height: 300,
}
const A = new Vector(150, 100)
const B = new Vector(450, 200)
const C = new Vector(650, 200)
const snappers = [A, B, C, Line.fromPoints(A, B)]

function Problem({ x }) {
	return <>
		<Par>Gegeven is de onderstaande structuur.</Par>
		<EngineeringDiagram {...diagramSettings} svgContents={<Schematics opacity={1} />} htmlContents={<Elements />} />
		<Par>Teken voor het balkonderdeel rechts het Vrijlichaamschema/Schematisch diagram.</Par>
		<InputSpace>
			<FBDInput id="beam" {...diagramSettings} svgContents={<Schematics opacity={0.1} />} htmlContents={<Elements />} snappers={snappers} />
		</InputSpace>
	</>
}

function Schematics({ opacity }) {
	return <>
		<Group style={{ opacity }}>
			<Beam points={[[150, 100], [350, 100], [350, 200], [450, 200]]} />
			<Force positionedVector={{ vector: [0, 80], end: [250, 100] }} color="darkred" />
			<Moment position={[350, 100]} color="darkblue" opening={Math.PI} />
			<RollerSupport position={[150, 100]} angle={Math.PI} />
		</Group>

		<Group>
			<Beam points={[[450, 200], [550, 100], [650, 100]]} color="darkgreen" />
			<HingeSupport position={[650, 100]} angle={Math.PI / 4} color="darkgreen" style={{ opacity }} />
			<Moment position={[550, 100]} color="darkred" clockwise={true} />
		</Group>

		<Hinge position={[450, 200]} color="darkred" style={{ opacity }} />
		<Force positionedVector={{ vector: [0, 150], end: [450, 200] }} color="darkblue" />

		<Distance positionedVector={{ start: [150, 250], end: [450, 250] }} />
		<Distance positionedVector={{ start: [450, 250], end: [650, 250] }} />
		<Distance positionedVector={{ start: [720, 100], end: [720, 200] }} />
	</>
}

function Elements() {
	return <>
		<PositionedElement position={[300, 250]} anchor={[0.5, 1]} scale={1.2} ><M>L_1 = 3\ (\rm m)</M></PositionedElement>
		<PositionedElement position={[550, 250]} anchor={[0.5, 1]} scale={1.2}><M>L_2 = 2\ (\rm m)</M></PositionedElement>
		<PositionedElement position={[720, 150]} anchor={[0.5, 1]} scale={1.2} rotate={Math.PI / 2}><M>h = 1\ (\rm m)</M></PositionedElement>
	</>
}

function Solution() {
	return <Par>Deze oplossing gaat nog geschreven worden. [ToDo]</Par>
}

function getFeedback({ state, input, progress }) {
	return {} // ToDo

	// const { x } = state
	// const { ans } = input
	// const correct = progress.solved || false
	// if (correct)
	// 	return { ans: { correct, text: selectRandomCorrect() } }
	// return {
	// 	ans: {
	// 		correct,
	// 		text: Math.abs(x) === Math.abs(ans) ? (
	// 			ans > 0 ? 'Je bent het minteken vergeten.' : 'Probeer het minteken te verwijderen.'
	// 		) : selectRandomIncorrect()
	// 	}
	// }
}