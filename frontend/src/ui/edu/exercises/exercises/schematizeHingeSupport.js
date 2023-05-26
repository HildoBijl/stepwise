import React from 'react'

import { deg2rad } from 'step-wise/util/numbers'
import { Vector, Line } from 'step-wise/geometry'

import { selectRandomCorrect } from 'util/feedbackMessages'
import { Par } from 'ui/components'
import { useScaleBasedTransformationSettings } from 'ui/components/figures'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'
import { InputSpace } from 'ui/form/FormPart'
import { Drawing } from 'ui/components/figures'

import { Group, Beam, HingeSupport, render } from 'ui/edu/content/mechanics/EngineeringDiagram'
import FBDInput, { allConnectedToPoints, loadTypes } from 'ui/edu/content/mechanics/FBDInput'

import StepExercise from '../types/StepExercise'
import { useSolution } from '../util/SolutionProvider'
import { getInputFieldFeedback, getMCFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	return <>
		<Par>Een balk is met een scharnierverbinding aan een muur bevestigd, zoals hieronder weergegeven.</Par>
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
						<>Ja. Een scharnierverbinding voorkomt beweging loodrecht op de muur. Dus er is een reactiekracht die die beweging voorkomt.</>,
						<>Ja. Een scharnierverbinding laat beweging loodrecht op de muur toe. Dus er is een reactiekracht die die beweging veroorzaakt.</>,
						<>Nee. Een scharnierverbinding voorkomt beweging loodrecht op de muur. Dus kan er geen reactiekracht zijn die een eventuele beweging veroorzaakt.</>,
						<>Nee. Een scharnierverbinding laat beweging loodrecht op de muur toe. Dus kan er geen reactiekracht zijn die die beweging voorkomt.</>,
					]} />
				</InputSpace>
			</>
		},
		Solution: () => {
			return <Par>Een scharnierverbinding voorkomt beweging loodrecht op de muur. Dus er is een reactiekracht die die beweging voorkomt.</Par>
		},
	},
	{
		Problem: () => {
			return <>
				<Par>Bepaal of je een reactiekracht parallel aan het muuroppervlak moet tekenen.</Par>
				<InputSpace>
					<MultipleChoice id="forceParallel" choices={[
						<>Ja. Een scharnierverbinding voorkomt beweging parallel aan de muur. Dus er is een reactiekracht die die beweging voorkomt.</>,
						<>Ja. Een scharnierverbinding laat beweging parallel aan de muur toe. Dus er is een reactiekracht die die beweging veroorzaakt.</>,
						<>Nee. Een scharnierverbinding voorkomt beweging parallel aan de muur. Dus kan er geen reactiekracht zijn die een eventuele beweging veroorzaakt.</>,
						<>Nee. Een scharnierverbinding laat beweging parallel aan de muur toe. Dus kan er geen reactiekracht zijn die die beweging voorkomt.</>,
					]} />
				</InputSpace>
			</>
		},
		Solution: () => {
			return <Par>Een scharnierverbinding voorkomt beweging parallel aan de muur. Dus er is een reactiekracht die die beweging voorkomt.</Par>
		},
	},
	{
		Problem: () => {
			return <>
				<Par>Bepaal of je een reactiemoment moet tekenen.</Par>
				<InputSpace>
					<MultipleChoice id="moment" choices={[
						<>Ja. Een scharnierverbinding voorkomt een draaibeweging. Dus er is een reactiemoment dat die draaiing voorkomt.</>,
						<>Ja. Een scharnierverbinding laat een draaibeweging toe. Dus er is een reactiemoment dat die draaiing veroorzaakt.</>,
						<>Nee. Een scharnierverbinding voorkomt een draaibeweging. Er is dus geen reactiemoment om een eventuele draaiing te veroorzaken.</>,
						<>Nee. Een scharnierverbinding laat een draaibeweging toe. Er is dus geen reactiemoment om de draaiing te voorkomen.</>,
					]} />
				</InputSpace>
			</>
		},
		Solution: () => {
			return <Par>Een scharnierverbinding laat een draaibeweging toe. Er is dus geen reactiemoment om de draaiing te voorkomen.</Par>
		},
	},
	{
		Problem: () => {
			return <>
				<Par>Teken in het diagram een reactiekracht loodrecht op de muur en een reactiekracht parallel aan de muur.</Par>
				<InputSpace>
					<Diagram isInputField={true} showSupports={false} />
				</InputSpace>
			</>
		},
		Solution: () => {
			return <>
				<Par>Het uiteindelijke diagram is als volgt.</Par>
				<Diagram isInputField={false} showSupports={false} showSolution={true} />
				<Par>Er zijn ook andere oplossingen die OK zijn. Denk aan een horizontale en een verticale kracht, of een kracht langs de balk en een kracht loodrecht op de balk. Ook is het niet van invloed of een krachtenpijl begint of juist eindigt in het betreffende punt. Zolang er twee reactiekrachten (niet in dezelfde richting, en bij sterke voorkeur loodrecht op elkaar) zijn zonder reactiemoment is het werkbaar.</Par>
			</>
		},
	},
]

function getFeedback(exerciseData) {
	// Determine MC feedback text in various cases.
	const forcePerpendicularText = [
		<>{selectRandomCorrect()}</>,
		<>Nee. Hoezo zou de balk kunnen bewegen?</>,
		<>Nee. Hoe zou een reactiekracht een beweging kunnen veroorzaken?</>,
		<>Nee. Hoezo zou de balk kunnen bewegen?</>,
	]
	const forceParallelText = forcePerpendicularText
	const momentText = [
		<>Nee. Hoe is een scharnier in staat om draaiing te voorkomen?</>,
		<>Nee. Hoe zou een reactiemoment een draaiing kunnen veroorzaken?</>,
		<>Nee. Hoe is een scharnier in staat om draaiing te voorkomen?</>,
		<>{selectRandomCorrect()}</>,
	]

	// Set up feedback checks for the loads field.
	const wrongNumberOfForces = input => {
		const forces = input.filter(load => load.type === loadTypes.force)
		return forces.length !== 2 && <>Je hebt wat te {forces.length > 2 ? 'veel' : 'weinig'} krachten getekend.</>
	}
	const forcesAlongSameLine = input => {
		const forces = input.filter(load => load.type === loadTypes.force)
		return forces[0].span.alongEqualLine(forces[1].span) && { text: <>Je twee krachten liggen langs dezelfde lijn. Dat maakt één ervan overbodig.</>, affectedLoads: forces }
	}
	const wrongNumberOfMoments = input => {
		const moments = input.filter(load => load.type === loadTypes.moment)
		return moments.length !== 0 && { text: (moments.length > 1 ? <>Zijn de getekende momenten wel nodig?</> : <>Is het getekende moment wel nodig?</>), affectedLoads: moments }
	}
	const nonPerpendicular = input => {
		const forces = input.filter(load => load.type === loadTypes.force)
		return !forces[0].span.isPerpendicular(forces[1].span) && <>In theorie is dit werkbaar, maar het is veel handiger om je twee krachten loodrecht op elkaar te tekenen.</>
	}
	const loadsChecks = [wrongNumberOfForces, forcesAlongSameLine, wrongNumberOfMoments, nonPerpendicular]

	return {
		...getMCFeedback('forcePerpendicular', exerciseData, { text: forcePerpendicularText }),
		...getMCFeedback('forceParallel', exerciseData, { text: forceParallelText }),
		...getMCFeedback('moment', exerciseData, { text: momentText }),
		...getInputFieldFeedback('loads', exerciseData, { feedbackChecks: loadsChecks }),
	}
}

function Diagram({ isInputField = false, showSupports = true, showSolution = false }) {
	const solution = useSolution()
	const { wallRotation, beamRotation, points, loads } = solution

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

		<HingeSupport position={points[0]} angle={deg2rad(wallRotation + 180)} style={{ opacity: showSupports ? 1 : 0.1 }} />

		<Group>{render(loads)}</Group>
	</>
}
