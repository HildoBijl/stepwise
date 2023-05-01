import React from 'react'

import { Vector, Line } from 'step-wise/geometry'

import { Par, M, BM } from 'ui/components'
import { CornerLabel, useCurrentBackgroundColor, useScaleAndShiftTransformationSettings } from 'ui/components/figures'
import { InputSpace } from 'ui/form/FormPart'
import { useInput } from 'ui/form/Form'
import FloatUnitInput from 'ui/form/inputs/FloatUnitInput'

import EngineeringDiagram, { Group, Beam, FixedSupport, Distance, Element, Label, LoadLabel, render } from 'ui/edu/content/mechanics/EngineeringDiagram'
import FBDInput, { allConnectedToPoints, getFBDFeedback, loadSources, performLoadsComparison } from 'ui/edu/content/mechanics/FBDInput'
import { sumOfForces, sumOfMoments } from 'ui/edu/content/mechanics/latex'

import StepExercise, { getStep } from '../types/StepExercise'
import { useSolution } from '../util/SolutionProvider'
import { getInputFieldFeedback } from '../util/feedback'

const distanceShift = 60

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { P, angle, getLoadNames } = useSolution()
	const inputLoads = useInput('loads')
	const loadNames = getLoadNames(inputLoads).filter(load => !load.prenamed)

	return <>
		<Par>Een balk is aan een muur ingeklemd en belast met een kracht van <M>P = {P}.</M> De kracht heeft een hoek van <M>{angle}^\circ</M> ten opzichte van de horizontaal.</Par>
		<Diagram isInputField={false} />
		<Par>Teken het vrijlichaamsschema/schematisch diagram.</Par>
		<InputSpace>
			<Diagram id="loads" isInputField={true} showSupports={false} />
		</InputSpace>
		<Par>Bereken hierin de onbekende reactiekrachten/momenten.</Par>
		<InputSpace>
			{loadNames.map(loadName => <FloatUnitInput key={loadName.variable.name} id={loadName.variable.name} prelabel={<M>{loadName.variable}=</M>} size="s" />)}
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			return <>
				<Par>Teken het vrijlichaamsschema/schematisch diagram.</Par>
				<InputSpace>
					<Diagram id="loads" isInputField={true} showSupports={false} />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { hasAdjustedSolution } = useSolution()
			return <>
				<Par>Een inklemming voorkomt alle beweging, en zorgt dus voor een horizontale reactiekracht, een verticale reactiekracht en een reactiemoment. Samen met de externe belasting geeft dit het volgende schema.</Par>
				<Diagram showSolution={true} showSupports={false} />
				<Par>{hasAdjustedSolution ? <>Merk op dat dit conform jouw getekende diagram is. De reactiekrachten/momenten mogen ook andersom, indien gewenst.</> : <>De richtingen van de reactiekrachten/momenten zijn zo gekozen dat de waarden positief worden. Ze mogen ook de andere kant op getekend worden, maar dan worden de berekende krachten/momenten negatief.</>}</Par>
			</>
		},
	},
	{
		Problem: () => {
			const { loadVariables } = useSolution()
			const vFAx = loadVariables[1]
			return <>
				<Par>Bereken de horizontale reactiekracht <M>{vFAx}.</M></Par>
				<InputSpace>
					<FloatUnitInput id={vFAx.name} prelabel={<M>{vFAx}=</M>} size="s" />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { loadVariables, directionIndices, angle, P, Px, FAx } = useSolution()
			const [, vFAx, vFAy, vMA] = loadVariables

			return <>
				<Par>
					Om <M>{vFAx}</M> te vinden bekijken we de som van de krachten in de horizontale richting. In dit geval hebben <M>{vFAy}</M> en <M>{vMA}</M> geen invloed. Dit geeft ons de evenwichtsvergelijking
					<BM>{sumOfForces(false)} P_x {directionIndices[1] ? '-' : '+'} {vFAx} = 0.</BM>
					Hierbij is de horizontale component <M>P_x</M> gelijk aan
					<BM>P_x = P \cos\left({angle}\right) = {P.float} \cdot \cos\left({angle}\right) = {Px}.</BM>
					Als we de evenwichtsvergelijking oplossen voor <M>{vFAx}</M> krijgen we
					<BM>{vFAx} = {directionIndices[1] ? '' : '-'} P_x = {FAx}.</BM>
				</Par>
			</>
		},
	},
	{
		Problem: () => {
			const { loadVariables } = useSolution()
			const vFAy = loadVariables[2]
			return <>
				<Par>Bereken de verticale reactiekracht <M>{vFAy}.</M></Par>
				<InputSpace>
					<FloatUnitInput id={vFAy.name} prelabel={<M>{vFAy}=</M>} size="s" />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { loadVariables, directionIndices, angle, P, Py, FAy } = useSolution()
			const [, vFAx, vFAy, vMA] = loadVariables

			return <>
				<Par>
					Om <M>{vFAy}</M> te vinden bekijken we de som van de krachten in de verticale richting. In dit geval hebben <M>{vFAx}</M> en <M>{vMA}</M> geen invloed. Dit geeft ons de evenwichtsvergelijking
					<BM>{sumOfForces(true)} {directionIndices[2] ? '' : '-'} {vFAy} - P_y = 0.</BM>
					Hierbij is de verticale component <M>P_y</M> gelijk aan
					<BM>P_y = P \sin\left({angle}\right) = {P.float} \cdot \sin\left({angle}\right) = {Py}.</BM>
					Als we de evenwichtsvergelijking oplossen voor <M>{vFAy}</M> krijgen we
					<BM>{vFAy} = {directionIndices[2] ? '' : '-'} P_y = {FAy}.</BM>
				</Par>
			</>
		},
	},
	{
		Problem: () => {
			const { loadVariables } = useSolution()
			const vMA = loadVariables[3]
			return <>
				<Par>Bereken het reactiemoment <M>{vMA}.</M></Par>
				<InputSpace>
					<FloatUnitInput id={vMA.name} prelabel={<M>{vMA}=</M>} size="s" />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { loadVariables, directionIndices, l1, Py, MA } = useSolution()
			const [, vFAx, vFAy, vMA] = loadVariables

			return <>
				<Par>
					Om <M>{vMA}</M> te vinden bekijken we de som van de momenten om punt <M>A.</M> In dit geval hebben <M>{vFAx}</M> en <M>{vFAy}</M> geen invloed. Dit geeft ons de evenwichtsvergelijking
					<BM>{sumOfMoments('A', false)} P_y l_1 {directionIndices[3] ? '-' : '+'} {vMA} = 0.</BM>
					De oplossing volgt als
					<BM>{vMA} = {directionIndices[3] ? '' : '-'} P_y l_1 = {directionIndices[3] ? '' : '-'} {Py.float} \cdot {l1.float} = {MA}.</BM>
					Hiermee zijn alle reactiekrachten/momenten bekend.
				</Par>
			</>
		},
	},
]

function Diagram({ isInputField = false, showSupports = true, showSolution = false }) {
	const solution = useSolution()
	const { points, loads, getLoadNames, angleRad } = solution

	// Define the transformation.
	const transformationSettings = useScaleAndShiftTransformationSettings(points, { scale: 70, margin: [[120, 80], [90, 110]] })

	// Get all the required components.
	const loadsToDisplay = isInputField ? [] : (showSolution ? loads : loads.filter(load => load.source === loadSources.external))
	const schematics = <Schematics {...solution} showSupports={showSupports} loads={loadsToDisplay} />
	const elements = <Elements {...solution} loads={loadsToDisplay} />

	// Set up either a diagram or an input field with said diagram.
	const snappers = [...Object.values(points), Line.fromPointAndAngle(points.B, angleRad)]
	return isInputField ?
		<FBDInput id="loads" transformationSettings={transformationSettings} svgContents={schematics} htmlContents={elements} snappers={snappers} validate={allConnectedToPoints(points)} getLoadNames={getLoadNames} /> :
		<EngineeringDiagram transformationSettings={transformationSettings} svgContents={schematics} htmlContents={elements} />
}

function Schematics({ points, loads, showSupports = true }) {
	const { A, B, C } = points

	return <>
		<Beam points={[A, C]} />

		<Group style={{ opacity: showSupports ? 1 : 0.1 }}>
			<FixedSupport position={points.A} angle={Math.PI} />
		</Group>

		<Group>{render(loads)}</Group>

		<Distance span={{ start: A, end: B }} graphicalShift={new Vector(0, distanceShift)} />
		<Distance span={{ start: B, end: C }} graphicalShift={new Vector(0, distanceShift)} />
	</>
}

function Elements({ l1, l2, angle, points, loads, getLoadNames }) {
	const background = useCurrentBackgroundColor()
	const distanceLabelStyle = { background, padding: '0.3rem' }
	const loadNames = getLoadNames(loads)
	const { A, B, C } = points
	const externalLoad = loads.find(load => load.source === loadSources.external)

	return <>
		<Label position={A} angle={Math.PI / 4} graphicalDistance={7}><M>A</M></Label>
		<Label position={B} angle={Math.PI / 2} graphicalDistance={4}><M>B</M></Label>
		<Label position={C} angle={0} graphicalDistance={6}><M>C</M></Label>
		<Element position={A.interpolate(B)} graphicalShift={new Vector(0, distanceShift)} anchor={[0.5, 0.5]} style={distanceLabelStyle}><M>l_1 = {l1}</M></Element>
		<Element position={B.interpolate(C)} graphicalShift={new Vector(0, distanceShift)} anchor={[0.5, 0.5]} style={distanceLabelStyle}><M>l_2 = {l2}</M></Element>
		{externalLoad ? <CornerLabel points={[externalLoad.span.start, B, A]} graphicalSize={32}><M>{angle}^\circ</M></CornerLabel> : null}
		{loadNames.map((loadName, index) => <LoadLabel key={index} {...loadName} />)}
	</>
}

function getFeedback(exerciseData) {
	const { input, progress, solution, shared } = exerciseData
	const { loads, points, loadsToCheck } = solution

	// On an incorrect FBD on the main problem, only give feedback on the FBD.
	const step = getStep(progress)
	const loadsFeedback = input.loads && getFBDFeedback(input.loads, loads, shared.data.comparison.loads, points)
	if (step === 0 && !performLoadsComparison('loads', input, solution, shared.data.comparison))
		return { loads: loadsFeedback }

	// Give full feedback.
	return {
		loads: loadsFeedback,
		...getInputFieldFeedback(loadsToCheck, exerciseData)
	}
}
