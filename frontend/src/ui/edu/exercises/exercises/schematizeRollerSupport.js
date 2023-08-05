import React from 'react'

import { deg2rad } from 'step-wise/util/numbers'
import { Vector, Line } from 'step-wise/geometry'

import { selectRandomCorrect } from 'util/feedbackMessages'
import { Par } from 'ui/components'
import { Drawing, useScaleBasedTransformationSettings } from 'ui/figures'
import { InputSpace } from 'ui/form'
import { MultipleChoice } from 'ui/inputs'

import { Group, Beam, RollerSupport, render } from 'ui/edu/content/mechanics/EngineeringDiagram'
import FBDInput, { allConnectedToPoints, loadTypes, areLoadsEqual, getFBDFeedbackFunction, FBDComparison } from 'ui/edu/content/mechanics/FBDInput'

import StepExercise from '../types/StepExercise'
import { useSolution } from '../util/SolutionProvider'
import { getInputFieldFeedback, getMCFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	return <>
		<Par>Een balk is met een schuifverbinding aan een muur bevestigd, zoals hieronder weergegeven.</Par>
		<Diagram isInputField={false} />
		<Par>We kunnen deze bevestiging schematiseren door de bevestiging weg te halen en te vervangen voor reactiekrachten/momenten. Teken de bijbehorende reactiekrachten/momenten.</Par>
		<InputSpace>
			<Diagram isInputField={true} showSupports={false} />
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			return <>
				<Par>Bepaal of je een reactiekracht loodrecht op het muuroppervlak moet tekenen.</Par>
				<InputSpace>
					<MultipleChoice id="forcePerpendicular" choices={[
						<>Ja. Een schuifverbinding voorkomt beweging loodrecht op de muur. Dus er is een reactiekracht die die beweging voorkomt.</>,
						<>Ja. Een schuifverbinding laat beweging loodrecht op de muur toe. Dus er is een reactiekracht die die beweging veroorzaakt.</>,
						<>Nee. Een schuifverbinding voorkomt beweging loodrecht op de muur. Dus kan er geen reactiekracht zijn die een eventuele beweging veroorzaakt.</>,
						<>Nee. Een schuifverbinding laat beweging loodrecht op de muur toe. Dus kan er geen reactiekracht zijn die die beweging voorkomt.</>,
					]} />
				</InputSpace>
			</>
		},
		Solution: () => {
			return <Par>Een schuifverbinding voorkomt beweging loodrecht op de muur. Dus er is een reactiekracht die die beweging voorkomt.</Par>
		},
	},
	{
		Problem: () => {
			return <>
				<Par>Bepaal of je een reactiekracht parallel aan het muuroppervlak moet tekenen.</Par>
				<InputSpace>
					<MultipleChoice id="forceParallel" choices={[
						<>Ja. Een schuifverbinding voorkomt beweging parallel aan de muur. Dus er is een reactiekracht die die beweging voorkomt.</>,
						<>Ja. Een schuifverbinding laat beweging parallel aan de muur toe. Dus er is een reactiekracht die die beweging veroorzaakt.</>,
						<>Nee. Een schuifverbinding voorkomt beweging parallel aan de muur. Dus kan er geen reactiekracht zijn die een eventuele beweging veroorzaakt.</>,
						<>Nee. Een schuifverbinding laat beweging parallel aan de muur toe. Dus kan er geen reactiekracht zijn die die beweging voorkomt.</>,
					]} />
				</InputSpace>
			</>
		},
		Solution: () => {
			return <Par>Een schuifverbinding laat beweging parallel aan de muur toe. Dus kan er geen reactiekracht zijn die die beweging voorkomt.</Par>
		},
	},
	{
		Problem: () => {
			return <>
				<Par>Bepaal of je een reactiemoment moet tekenen.</Par>
				<InputSpace>
					<MultipleChoice id="moment" choices={[
						<>Ja. Een schuifverbinding voorkomt een draaibeweging. Dus er is een reactiemoment dat die draaiing voorkomt.</>,
						<>Ja. Een schuifverbinding laat een draaibeweging toe. Dus er is een reactiemoment dat die draaiing veroorzaakt.</>,
						<>Nee. Een schuifverbinding voorkomt een draaibeweging. Er is dus geen reactiemoment om een eventuele draaiing te veroorzaken.</>,
						<>Nee. Een schuifverbinding laat een draaibeweging toe. Er is dus geen reactiemoment om de draaiing te voorkomen.</>,
					]} />
				</InputSpace>
			</>
		},
		Solution: () => {
			return <Par>Een schuifverbinding voorkomt een draaibeweging. Dus er is een reactiemoment dat die draaiing voorkomt.</Par>
		},
	},
	{
		Problem: () => {
			return <>
				<Par>Teken in het diagram een reactiekracht loodrecht op de muur en een reactiemoment.</Par>
				<InputSpace>
					<Diagram isInputField={true} showSupports={false} />
				</InputSpace>
			</>
		},
		Solution: () => {
			return <>
				<Par>Het uiteindelijke diagram is als volgt.</Par>
				<Diagram isInputField={false} showSupports={false} showSolution={true} />
				<Par>Merk op dat het niet van invloed is of een krachtenpijl begint of juist eindigt in het betreffende punt. Ook maakt het niet uit waar de momentenpijl begint/eindigt.</Par>
			</>
		},
	},
]

function getFeedback(exerciseData) {
	// Determine MC feedback text in various cases.
	const forcePerpendicularText = [
		<>{selectRandomCorrect()}</>,
		<>Nee. Hoezo zou de balk loodrecht op de muur kunnen bewegen?</>,
		<>Nee. Hoe zou een reactiekracht een beweging kunnen veroorzaken?</>,
		<>Nee. Hoezo zou de balk loodrecht op de muur kunnen bewegen?</>,
	]
	const forceParallelText = [
		<>Nee. Hoe is een schuifverbinding in staat om beweging parallel aan de muur te voorkomen?</>,
		<>Nee. Hoe zou een reactiekracht een beweging kunnen veroorzaken?</>,
		<>Nee. Hoe is een schuifverbinding in staat om beweging parallel aan de muur te voorkomen?</>,
		<>{selectRandomCorrect()}</>,
	]
	const momentText = [
		<>{selectRandomCorrect()}</>,
		<>Nee. Hoezo zou de balk kunnen draaien?</>,
		<>Nee. Hoe zou een reactiemoment een draaiing kunnen veroorzaken?</>,
		<>Nee. Hoezo zou de balk kunnen draaien?</>,
	]

	// Set up feedback checks for the loads field.
	const wrongNumberOfForces = input => {
		const forces = input.filter(load => load.type === loadTypes.force)
		return forces.length !== 1 && (forces.length > 1 ? <>Je hebt meer krachten getekend dan hier gepast is.</> : <>Je hebt helemaal geen reactiekrachten getekend.</>)
	}
	const forcesAlongSameLine = (input, correct) => {
		const forces = input.filter(load => load.type === loadTypes.force)
		return !areLoadsEqual(forces[0], correct[0], FBDComparison) && { text: <>De getekende reactiekracht heeft niet de juiste richting.</>, affectedLoads: forces }
	}
	const wrongNumberOfMoments = input => {
		const moments = input.filter(load => load.type === loadTypes.moment)
		return moments.length !== 1 && (moments.length > 1 ? <>Je hebt wat te veel momenten getekend.</> : <>Is er nog een moment nodig?</>)
	}
	const loadsChecks = [wrongNumberOfForces, forcesAlongSameLine, wrongNumberOfMoments]

	return {
		...getMCFeedback('forcePerpendicular', exerciseData, { text: forcePerpendicularText }),
		...getMCFeedback('forceParallel', exerciseData, { text: forceParallelText }),
		...getMCFeedback('moment', exerciseData, { text: momentText }),
		...getInputFieldFeedback('loads', exerciseData, { feedbackChecks: loadsChecks, feedbackFunction: getFBDFeedbackFunction(FBDComparison) }),
	}
}

function Diagram({ isInputField = false, showSupports = true, showSolution = false }) {
	const { wallRotation, beamRotation, points, loads } = useSolution()

	// Define the transformation.
	const transformationSettings = useScaleBasedTransformationSettings(points, { scale: 70, margin: 100 })

	// Get all the required components.
	const loadsToDisplay = showSolution ? loads : []
	const schematics = <Schematics showSupports={showSupports} loads={loadsToDisplay} />

	// Set up either a diagram or an input field with said diagram.
	const A = points[0]
	const snappers = [A, Line.fromPointAndAngle(A, deg2rad(wallRotation)), Line.fromPointAndAngle(A, deg2rad(wallRotation + 90)), Line.fromPointAndAngle(A, deg2rad(wallRotation + beamRotation)), Line.fromPointAndAngle(A, deg2rad(wallRotation + beamRotation + 90))]
	return isInputField ?
		<FBDInput id="loads" transformationSettings={transformationSettings} snappers={snappers} validate={allConnectedToPoints(points)}>{schematics}</FBDInput> :
		<Drawing transformationSettings={transformationSettings}>{schematics}</Drawing>
}

function Schematics({ loads, showSupports = true }) {
	const { points, wallRotation, beamRotation } = useSolution()

	return <>
		<Group overflow={false}>
			<Beam points={[Vector.zero, Vector.fromPolar(3, deg2rad(wallRotation + beamRotation))]} />
		</Group>

		<RollerSupport position={points[0]} angle={deg2rad(wallRotation + 180)} style={{ opacity: showSupports ? 1 : 0.1 }} />

		<Group>{render(loads)}</Group>
	</>
}
