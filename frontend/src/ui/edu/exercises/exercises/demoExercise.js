import React from 'react'

import { deg2rad } from 'step-wise/util/numbers'
import { Vector, Line, Span } from 'step-wise/geometry'

import { Par, M, BM, BMList, BMPart } from 'ui/components'
import { InputSpace } from 'ui/form/FormPart'
import { useInput } from 'ui/form/Form'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'
import { useCurrentBackgroundColor, useScaleAndShiftTransformationSettings } from 'ui/components/figures/Drawing'

import EngineeringDiagram, { Group, Beam, HingeSupport, RollerHingeSupport, Distance, Element, Label, CornerLabel, LoadLabel, render } from 'ui/edu/content/mechanics/EngineeringDiagram'
import FBDInput, { allConnectedToPoints, getFBDFeedback, loadSources, performLoadsComparison } from 'ui/edu/content/mechanics/FBDInput'
import { sumOfForces, sumOfMoments } from 'ui/edu/content/mechanics/latex'

import SimpleExercise from '../types/SimpleExercise'
import { useSolution } from '../util/SolutionProvider'
import { getInputFieldFeedback } from '../util/feedback'

window.Vector = Vector
window.Line = Line
window.Span = Span

const distanceShift = 60

export default function Exercise() {
	return <SimpleExercise Problem={Problem} Solution={Solution} getFeedback={getFeedback} />
}

function Problem() {
	const solution = useSolution()
	const { P, theta, getLoadNames } = solution
	const inputLoads = useInput('loads')
	const loadNames = getLoadNames(inputLoads).filter(load => !load.prenamed)

	return <>
		<Par>Gegeven is de onderstaande balk met een externe belasting van <M>P = {P},</M> onder een hoek van <M>{theta}^\circ.</M></Par>
		<Diagram isInputField={false} />
		<Par>Teken het vrijlichaamsschema/schematisch diagram.&nbsp;
			<InputSpace>
				<Diagram isInputField={true} showSupports={false} />
			</InputSpace>
			Bereken hierin de onbekende reactiekrachten/momenten.
			<InputSpace>
				{loadNames.map(loadName => <FloatUnitInput key={loadName.variable.name} id={loadName.variable.name} prelabel={<M>{loadName.variable}=</M>} size="s" />)}
			</InputSpace>
		</Par>
	</>
}

function Diagram({ isInputField = false, showSupports = true, showSolution = false }) {
	const solution = useSolution()
	const { theta, points, loads, getLoadNames } = solution

	// Define the transformation.
	const transformationSettings = useScaleAndShiftTransformationSettings(points, { scale: 70, margin: [120, [100, 120]] })

	// Get all the required components.
	const loadsToDisplay = isInputField ? [] : (showSolution ? loads : loads.filter(load => load.source === loadSources.external))
	const schematics = <Schematics {...solution} showSupports={showSupports} loads={loadsToDisplay} />
	const elements = <Elements {...solution} loads={loadsToDisplay} />

	// Set up either a diagram or an input field with said diagram.
	const snappers = [...Object.values(points), Line.fromPointAndAngle(points.B, deg2rad(theta))]
	return isInputField ?
		<FBDInput id="loads" transformationSettings={transformationSettings} svgContents={schematics} htmlContents={elements} snappers={snappers} validate={allConnectedToPoints(points)} getLoadNames={getLoadNames} /> :
		<EngineeringDiagram transformationSettings={transformationSettings} svgContents={schematics} htmlContents={elements} />
}

function Schematics({ points, loads, fixA, showSupports = true }) {
	return <>
		<Beam points={Object.values(points)} />

		<Group style={{ opacity: showSupports ? 1 : 0.1 }}>
			<HingeSupport position={points[fixA ? 'A' : 'C']} />
			<RollerHingeSupport position={points[fixA ? 'C' : 'A']} />
		</Group>

		<Group>{render(loads)}</Group>

		<Distance span={{ start: points.A, end: points.B }} graphicalShift={new Vector(0, distanceShift)} />
		<Distance span={{ start: points.B, end: points.C }} graphicalShift={new Vector(0, distanceShift)} />
	</>
}

function Elements({ theta, l1, l2, points, loads, getLoadNames }) {
	const background = useCurrentBackgroundColor()
	const distanceLabelStyle = { background, padding: '0.3rem' }
	const externalForce = loads[0]?.span
	const loadNames = getLoadNames(loads)

	return <>
		<Label position={points.A} angle={-Math.PI * 3 / 4} graphicalDistance={5}><M>A</M></Label>
		<Label position={points.B} angle={Math.PI / 2} graphicalDistance={3}><M>B</M></Label>
		<Label position={points.C} angle={-Math.PI / 4} graphicalDistance={5}><M>C</M></Label>
		{externalForce ? <CornerLabel points={[externalForce.start, externalForce.end, points.A]} graphicalSize={36}><M>{theta}^\circ</M></CornerLabel> : null}
		<Element position={points.A.interpolate(points.B)} graphicalShift={new Vector(0, distanceShift)} anchor={[0.5, 0.5]} style={distanceLabelStyle}><M>l_1 = {l1}</M></Element>
		<Element position={points.B.interpolate(points.C)} graphicalShift={new Vector(0, distanceShift)} anchor={[0.5, 0.5]} style={distanceLabelStyle}><M>l_2 = {l2}</M></Element>
		{loadNames.map((loadName, index) => <LoadLabel key={index} {...loadName} />)}
	</>
}

function Solution() {
	const { l1, l2, theta, fixA, Px, Py, loadValues, directionIndices, hasAdjustedSolution } = useSolution()
	return <>
		<Par>
			Als eerste tekenen we het vrijlichaamsschema. Aan de linkerkant zit een {fixA ? 'vast' : 'rollend'} scharnier. Deze kan {fixA ? 'horizontale en verticale' : 'alleen verticale'} reactiekrachten geven. Aan de rechterkant zit een {fixA ? 'rollend' : 'vast'} scharnier. Deze kan {fixA ? 'alleen verticale' : 'horizontale en verticale'} reactiekrachten geven. Samen met de externe belasting geeft dat het volgende vrijlichaamsschema. {hasAdjustedSolution ? <>Merk op dat dit conform jouw getekende diagram is. De reactiekrachten mogen ook andersom, indien gewenst.</> : <>De richtingen zijn zo gekozen dat de krachten positief worden. Ze mogen ook de andere kant op getekend worden, maar dan worden de berekende krachten negatief.</>}
		</Par>
		<Diagram showSolution={true} showSupports={false} />
		<Par>
			Vervolgens berekenen we de onbekende reactiekrachten.	We kunnen <M>P</M> ontbinden via
			<BMList>
				<BMPart>P_x = P \cdot \cos\left({theta}^\circ\right) = {Px},</BMPart>
				<BMPart>P_y = P \cdot \sin\left({theta}^\circ\right) = {Py}.</BMPart>
			</BMList>
			Als we de som van de krachten in horizontale richting bekijken, dan krijgen we de vergelijking
			<BM>{sumOfForces(false)} P_x {directionIndices[1] ? '-' : '+'} F_({fixA ? 'A' : 'C'}x) = 0.</BM>
			De oplossing volgt als
			<BM>F_({fixA ? 'A' : 'C'}x) = {directionIndices[1] ? '' : '-'} P_x = {loadValues[1]}.</BM>
			Via de som van de momenten kunnen we één van de verticale krachten vinden. Momenten om <M>A</M> geeft bijvoorbeeld
			<BM>{sumOfMoments('A')} -l_1 P_y {directionIndices[3] ? '+' : '-'} \left(l_1 + l_2\right) F_({fixA ? 'C' : 'Cy'}) = 0.</BM>
			De oplossing hiervan volgt als
			<BM>F_({fixA ? 'C' : 'Cy'}) = {directionIndices[3] ? '' : '-'} \frac(l_1)(l_1 + l_2) P_y = {directionIndices[3] ? '' : '-'} \frac({l1.float})({l1.float} + {l2.float}) \cdot {Py.float} = {loadValues[3]}.</BM>
			Als we tenslotte de som van de krachten in verticale richting bekijken, dan krijgen we de vergelijking
			<BM>{sumOfForces(true)} {directionIndices[2] ? '' : '-'} F_({fixA ? 'Ay' : 'A'}) {directionIndices[3] ? '+' : '-'} F_({fixA ? 'C' : 'Cy'}) - P_y = 0.</BM>
			Hieruit vinden we
			<BM>F_({fixA ? 'Ay' : 'A'}) = {directionIndices[2] ? '' : '-'} P_y {directionIndices[2] === directionIndices[3] ? '-' : '+'} F_({fixA ? 'C' : 'Cy'}) = {directionIndices[2] ? '' : '-'} {Py.float} {directionIndices[2] === directionIndices[3] ? '-' : '+'} {loadValues[3].float.texWithBrackets} = {loadValues[2]}.</BM>
			Hiermee zijn alle reactiekrachten berekend.
		</Par>
	</>
}

function getFeedback(exerciseData) {
	const { input, solution, shared } = exerciseData
	const { loads, points, loadsToCheck } = solution

	// On an incorrect FBD only give feedback on the FBD.
	const loadsFeedback = getFBDFeedback(input.loads, loads, shared.data.comparison.loads, points)
	if (!performLoadsComparison('loads', input, solution, shared.data.comparison))
		return { loads: loadsFeedback }

	// Give full feedback.
	return {
		loads: loadsFeedback,
		...getInputFieldFeedback(loadsToCheck, exerciseData)
	}
}
