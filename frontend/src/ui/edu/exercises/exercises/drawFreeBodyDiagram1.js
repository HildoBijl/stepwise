import React from 'react'

import { deg2rad } from 'step-wise/util/numbers'
import { Vector, Line } from 'step-wise/geometry'
import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'

import { selectRandomCorrect } from 'util/feedbackMessages'
import { Par } from 'ui/components/containers'
import { M, BM, BMList, BMPart } from 'ui/components/equations'
import { useCurrentBackgroundColor, useScaleAndShiftTransformationSettings } from 'ui/components/figures'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'
import { InputSpace } from 'ui/form/FormPart'

import EngineeringDiagram, { Group, PositionedElement, Distance, Beam, FixedSupport, HingeSupport, RollerSupport, RollerHingeSupport, render } from 'ui/edu/content/mechanics/EngineeringDiagram'
import FBDInput, { allConnectedToPoints, loadTypes } from 'ui/edu/content/mechanics/FBDInput'

import StepExercise from '../types/StepExercise'
import { useSolution } from '../util/SolutionProvider'
import { getInputFieldFeedback, getMCFeedback } from '../util/feedback'

const distanceShift = 70

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const supportNames = ['inklemming', 'scharnierverbinding', 'schuifverbinding', 'scharnierende schuifverbinding']
const supportObjects = [FixedSupport, HingeSupport, RollerSupport, RollerHingeSupport]

const Problem = (state) => {
	const { supportTypes } = useSolution()
	return <>
		<Par>Een balk is op twee punten bevestigd: links met een {supportNames[supportTypes[0]]} en rechts met een {supportNames[supportTypes[1]]}.</Par>
		<Diagram isInputField={false} />
		<Par>Teken het vrijlichaamsschema/schematisch diagram.</Par>
		<InputSpace>
			<Par>ToDo</Par>
			{/* <Diagram isInputField={true} showSupports={false} /> */}
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			return <>
				<Par>ToDo</Par>
				<InputSpace>
					<Par>ToDo</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			return <Par>ToDo</Par>
		},
	},
	{
		Problem: () => {
			return <>
				<Par>ToDo</Par>
				<InputSpace>
					<Par>ToDo</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			return <Par>ToDo</Par>
		},
	},
	{
		Problem: () => {
			return <>
				<Par>ToDo</Par>
				<InputSpace>
					<Par>ToDo</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			return <Par>ToDo</Par>
		},
	},
]

function getFeedback(exerciseData) {
	return {}

	// ToDo
	// // Determine MC feedback text in various cases.
	// const forcePerpendicularText = [
	// 	<>{selectRandomCorrect()}</>,
	// 	<>Nee. Hoezo zou de balk kunnen bewegen?</>,
	// 	<>Nee. Hoe zou een reactiekracht een beweging kunnen veroorzaken?</>,
	// 	<>Nee. Hoezo zou de balk kunnen bewegen?</>,
	// ]
	// const forceParallelText = forcePerpendicularText
	// const momentText = [
	// 	<>{selectRandomCorrect()}</>,
	// 	<>Nee. Hoezo zou de balk kunnen draaien?</>,
	// 	<>Nee. Hoe zou een reactiemoment een draaiing kunnen veroorzaken?</>,
	// 	<>Nee. Hoezo zou de balk kunnen draaien?</>,
	// ]

	// // Set up feedback checks for the loads field.
	// const wrongNumberOfForces = input => {
	// 	const forces = input.filter(load => load.type === loadTypes.force)
	// 	return forces.length !== 2 && <>Je hebt wat te {forces.length > 2 ? 'veel' : 'weinig'} krachten getekend.</>
	// }
	// const forcesAlongSameLine = input => {
	// 	const forces = input.filter(load => load.type === loadTypes.force)
	// 	return forces[0].span.alongEqualLine(forces[1].span) && { text: <>Je twee krachten liggen langs dezelfde lijn. Dat maakt één ervan overbodig.</>, affectedLoads: forces }
	// }
	// const wrongNumberOfMoments = input => {
	// 	const moments = input.filter(load => load.type === loadTypes.moment)
	// 	return moments.length !== 1 && (moments.length > 1 ? <>Je hebt wat te veel momenten getekend.</> : <>Is er nog een moment nodig?</>)
	// }
	// const nonPerpendicular = input => {
	// 	const forces = input.filter(load => load.type === loadTypes.force)
	// 	return !forces[0].span.isPerpendicular(forces[1].span) && <>In theorie is dit werkbaar, maar het is veel handiger om je twee krachten loodrecht op elkaar te tekenen.</>
	// }
	// const loadsChecks = [wrongNumberOfForces, forcesAlongSameLine, wrongNumberOfMoments, nonPerpendicular]

	// return {
	// 	...getMCFeedback('forcePerpendicular', exerciseData, { text: forcePerpendicularText }),
	// 	...getMCFeedback('forceParallel', exerciseData, { text: forceParallelText }),
	// 	...getMCFeedback('moment', exerciseData, { text: momentText }),
	// 	...getInputFieldFeedback('loads', exerciseData, { feedbackChecks: loadsChecks }),
	// }
}

function Diagram({ isInputField = false, showSupports = true, showSolution = false }) {
	const solution = useSolution()
	const { distances, supportTypes, loadProperties, left, A, B, right, points, loadPositionIndex, loadPoint, externalLoad, loadsLeft, loadsRight, loads } = solution

	// Define the transformation.
	const transformationSettings = useScaleAndShiftTransformationSettings(points, { scale: 70, margin: [80, [40, 100]] })

	// Get all the required components.
	const loadsToDisplay = showSolution ? loads : [externalLoad]
	const schematics = <Schematics loads={loadsToDisplay} showSupports={showSupports} />
	const elements = <Elements loads={loadsToDisplay} />

	// Set up either a diagram or an input field with said diagram.
	const snappers = [A, B, loadPoint]
	return isInputField ?
		<FBDInput id="loads" transformationSettings={transformationSettings} svgContents={schematics} htmlContents={elements} snappers={snappers} validate={allConnectedToPoints(points)} maxWidth={bounds => bounds.width} /> :
		<EngineeringDiagram transformationSettings={transformationSettings} svgContents={schematics} htmlContents={elements} maxWidth={bounds => bounds.width} />
}

function Schematics({ loads, showSupports = true }) {
	const { distances, supportTypes, loadProperties, left, A, B, right, points, loadPositionIndex, loadPoint, externalLoad, loadsLeft, loadsRight } = useSolution()

	const SupportLeft = supportObjects[supportTypes[0]]
	const SupportRight = supportObjects[supportTypes[1]]

	return <>
		<Group overflow={false}>
			<Beam points={points} />
		</Group>

		<SupportLeft position={A} angle={left.equals(A) ? Math.PI : Math.PI / 2} style={{ opacity: showSupports ? 1 : 0.1 }} />
		<SupportRight position={B} angle={right.equals(B) ? 0 : Math.PI / 2} style={{ opacity: showSupports ? 1 : 0.1 }} />

		<Group>
			{points.map((point, index) => {
				const prev = points[index - 1]
				if (index === 0 || prev.equals(point))
					return null
				return <Distance key={index} span={{ start: prev, end: point }} graphicalShift={new Vector(0, distanceShift)} />
			})}
		</Group>

		<Group>{render(loads)}</Group>
	</>
}

function Elements() {
	const { points } = useSolution()
	const background = useCurrentBackgroundColor()
	const distanceLabelStyle = { background, padding: '0.3rem' }

	return <>
		{points.map((point, index) => {
			const prev = points[index - 1]
			if (index === 0 || prev.equals(point))
				return null
			return <PositionedElement position={point.interpolate(prev)} graphicalShift={new Vector(0, distanceShift)} anchor={[0.5, 0.5]} style={distanceLabelStyle}><M>{new FloatUnit(`${point.x - prev.x}m`)}</M></PositionedElement>
		})}
	</>
}
