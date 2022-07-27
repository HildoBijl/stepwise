import React from 'react'

import { deg2rad, mod } from 'step-wise/util/numbers'
import { sortByIndices } from 'step-wise/util/arrays'
import { Vector, Line, PositionedVector } from 'step-wise/geometry'
import { Variable } from 'step-wise/CAS'

import { M } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import { InputSpace } from 'ui/form/Status'
import { useInput } from 'ui/form/Form'
import { useCurrentBackgroundColor, useScaleAndShiftTransformationSettings } from 'ui/components/figures/Drawing'

import EngineeringDiagram, { Group, Beam, HingeSupport, RollerHingeSupport, Distance, PositionedElement, Label, render } from 'ui/edu/content/mechanics/EngineeringDiagram'
import FBDInput, { allConnectedToPoints, getFBDFeedback, loadSources, loadTypes, FBDComparison, areLoadsEqual, isLoadAtPoint } from 'ui/edu/content/mechanics/FBDInput'

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
		<Par>Gegeven is de onderstaande balk met een externe belasting <M>P</M>.</Par>
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

	// ToDo: put this in a sensible place?
	const inputLoads = useInput('loads')
	const prenamedLoads = [{
		name: 'P',
		load: loads.find(load => load.source === loadSources.external),
		point: points.B,
	}]
	const loadNames = getLoadNames(inputLoads, points, prenamedLoads, FBDComparison)
	console.log(loadNames)

	// Define the transformation.
	const transformationSettings = useScaleAndShiftTransformationSettings(points, { scale: 70, margin: [120, [100, 120]] })

	// Get all the required components.
	const loadsToDisplay = isInputField ? [] : (showSolution ? loads : loads.filter(load => load.source === loadSources.external))
	const schematics = <Schematics {...solution} showSupports={!isInputField} loads={loadsToDisplay} />
	const elements = <Elements {...solution} loads={loadsToDisplay} />

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

function Elements({ l1, l2, points, loads }) {
	const background = useCurrentBackgroundColor()
	const distanceLabelStyle = { background, padding: '0.3rem' }
	const externalLoad = loads.find(load => load.source === loadSources.external)

	return <>
		<Label position={points.A} angle={-Math.PI * 3 / 4} graphicalDistance={5}><M>A</M></Label>
		<Label position={points.B} angle={Math.PI / 2} graphicalDistance={3}><M>B</M></Label>
		<Label position={points.C} angle={-Math.PI / 4} graphicalDistance={5}><M>C</M></Label>
		{/* {externalLoad ? <Label position={externalLoad.positionedVector.start} angle={externalLoad.positionedVector.vector.argument - Math.PI} graphicalDistance={0}><M>P</M></Label> : null} */}
		{loads.map((load, index) => <Label key={index} position={load.positionedVector.start} angle={load.positionedVector.vector.argument - Math.PI} graphicalDistance={3}><M>F_A</M></Label>)}
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





// ToDo: put this function in some more appropriate place.
// loads are an array [{...}] of loads.
// points is an object { 'A': new Vector(...), 'C': new Vector(...) }.
// prenamedLoads is of the form [{ load: {...}, name: 'P_A', point: 'A' }]
// Results are given in the form [{ load: {...}, name: 'P_A', point: 'A' }]
function getLoadNames(loads, points, prenamedLoads, comparison) {
	// If there are no loads yet, return nothing.
	console.log(loads)
	if (!loads)
		return []

	// Set up a result array and keep track of which loads have been put in.
	let result = []
	const named = loads.map(_ => false)

	// First assign the prenamed loads. For each, check if they match any of the given loads.
	prenamedLoads.forEach(prenamedLoad => {
		const index = loads.findIndex(load => areLoadsEqual(load, prenamedLoad.load, comparison))
		if (index !== -1 && !named[index]) {
			console.log('Prenaming ' + prenamedLoad.name)
			named[index] = true
			result.push({
				load: loads[index],
				name: prenamedLoad.name,
				point: prenamedLoad.point,
				prenamed: true,
			})
		}
	})

	// Then walk through the points, gathering (so far unnamed) loads connected to them.
	Object.keys(points).forEach(pointName => {
		// Gather loads connected to the given point and preemptively mark them as named.
		const point = points[pointName]
		const connectedLoadIndices = loads.map((load, index) => index).filter(index => !named[index] && isLoadAtPoint(loads[index], point))
		connectedLoadIndices.forEach(index => {
			named[index] = true
		})

		// Filter out forces and moments, and name them.
		const connectedLoads = connectedLoadIndices.map(index => loads[index])
		result = [...result, ...getLoadNamesForPoint(connectedLoads, point, pointName)]
	})

	// Finally walk through all remaining loads. Do not give them a point name to keep them nameless.
	const unconnectedLoads = loads.filter((load, index) => !named[index])
	result = [...result, ...getLoadNamesForPoint(unconnectedLoads)]

	// All loads have been named!
	return result
}

// getLoadNames takes a set of loads that are connected to the given point. It then determines proper names for them and returns these names with additional data as an array.
function getLoadNamesForPoint(loads, point, pointName) {
	return [
		...getForceNamesForPoint(loads.filter(load => load.type === loadTypes.force), point, pointName),
		...getMomentNamesForPoint(loads.filter(load => load.type === loadTypes.moment), point, pointName),
	]
}

// getForceNamesForPoint takes a set of forces that are connected to the given point. It then determines proper force names for them and returns them as an array.
function getForceNamesForPoint(forces, point, pointName) {
	// On a single force just name it F_A.
	if (forces.length === 1)
		return [{ load: forces[0], name: new Variable(pointName ? `F_${pointName}` : `F`), point: point || forces[0].positionedVector.start }]

	// On two forces that are horizontal and vertical, use F_{A,x} and F_{A,y}.
	if (forces.length === 2 && pointName) {
		if (forces[0].positionedVector.vector.isEqualDirection(Vector.i, true) && forces[1].positionedVector.vector.isEqualDirection(Vector.j, true)) {
			return [
				{ load: forces[0], name: new Variable(`F_${pointName},x`), point: point || forces[0].positionedVector.start },
				{ load: forces[1], name: new Variable(`F_${pointName},y`), point: point || forces[1].positionedVector.start },
			]
		} else if (forces[0].positionedVector.vector.isEqualDirection(Vector.j, true) && forces[1].positionedVector.vector.isEqualDirection(Vector.i, true)) {
			return [
				{ load: forces[1], name: new Variable(`F_${pointName},x`), point: point || forces[1].positionedVector.start },
				{ load: forces[0], name: new Variable(`F_${pointName},y`), point: point || forces[0].positionedVector.start },
			]
		}
	}

	// On multiple forces, sort them by vector argument, and then use F_{A,1}, F_{A,2}, and so forth.
	forces = sortByIndices(forces, forces.map(force => force.positionedVector.vector.argument))
	return forces.map((force, index) => ({ load: force, name: new Variable(pointName ? `F_${pointName},${index + 1}` : `F_${index + 1}`), point: point || force.positionedVector.start }))
}

// getMomentNamesForPoint takes a set of moments that are connected to the given point. It then determines proper moment names for them and returns them as an array.
function getMomentNamesForPoint(moments, point, pointName) {
	// On a single moment just name it M_A.
	if (moments.length === 1)
		return [{ load: moments[0], name: new Variable(pointName ? `M_${pointName}` : `M`), point: point || moments[0].position }]

	// Otherwise sort them, first by whether they're clockwise or counter-clockwise, and then by opening angle.
	const momentsByDirection = [moments.filter(moment => moment.clockwise),
	moments.filter(moment => !moment.clockwise)]
	moments = momentsByDirection.map(momentsList => sortByIndices(momentsList, momentsList.map(moment => mod(moment.opening, 2 * Math.PI)))).flat()
	return moments.map((moment, index) => ({ load: moment, name: new Variable(pointName ? `M_${pointName},${index + 1}` : `M_${index + 1}`), point: point || moment.position }))
}