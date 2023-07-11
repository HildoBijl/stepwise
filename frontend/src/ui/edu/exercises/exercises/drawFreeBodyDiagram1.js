import React, { Fragment } from 'react'

import { Vector } from 'step-wise/geometry'
import { FloatUnit } from 'step-wise/inputTypes/FloatUnit'

import { getCountingWord } from 'util/language'
import { selectRandomCorrect } from 'util/feedbackMessages'
import { Par, M } from 'ui/components'
import { Drawing, useScaleBasedTransformationSettings } from 'ui/figures'
import { InputSpace } from 'ui/form'
import { useCurrentBackgroundColor } from 'ui/form/inputs/DrawingInput'

import { Group, Element, Distance, Beam, FixedSupport, AdjacentFixedSupport, HingeSupport, HalfHingeSupport, RollerSupport, AdjacentRollerSupport, RollerHingeSupport, RollerHalfHingeSupport, render } from 'ui/edu/content/mechanics/EngineeringDiagram'
import FBDInput, { allConnectedToPoints, loadSources, getFBDFeedback, FBDComparison, getLoadMatching, isLoadAtPoint } from 'ui/edu/content/mechanics/FBDInput'

import StepExercise from '../types/StepExercise'
import { useSolution } from '../util/SolutionProvider'
import { getInputFieldFeedback } from '../util/feedback'

const distanceShift = 70
const supportNames = ['inklemming', 'scharnierverbinding', 'schuifverbinding', 'scharnierende schuifverbinding']
const supportExplanation = [
	<>De bevestiging is een inklemming: deze voorkomt beweging loodrecht op de muur, parallel aan de muur en draaiing. Dus zijn er reactiekrachten loodrecht op de muur en parallel aan de muur en is er een reactiemoment.</>,
	<>De bevestiging is een scharnierbevestiging: deze voorkomt beweging loodrecht op de muur en parallel aan de muur, maar laat draaiing toe. Dus zijn er reactiekrachten loodrecht op de muur en parallel aan de muur, maar is er geen reactiemoment.</>,
	<>De bevestiging is een schuifverbinding: deze voorkomt beweging loodrecht op de muur, maar laat beweging parallel aan de muur toe. Er is dus een reactiekracht loodrecht op de muur, maar geen reactiekracht parallel aan de muur. Omdat deze verbinding draaiing voorkomt is er wel een reactiemoment.</>,
	<>De bevestiging is een scharnierende schuifverbinding: deze voorkomt beweging loodrecht op de muur, maar laat beweging parallel aan de muur toe. Er is dus een reactiekracht loodrecht op de muur, maar geen reactiekracht parallel aan de muur. Omdat deze verbinding draaiing toelaat is er geen reactiemoment.</>,
]
const endSupportObjects = [FixedSupport, HingeSupport, RollerSupport, RollerHingeSupport]
const midSupportObjects = [AdjacentFixedSupport, HalfHingeSupport, AdjacentRollerSupport, RollerHalfHingeSupport]

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { supportTypes, loadProperties } = useSolution()
	return <>
		<Par>Een balk is op twee punten bevestigd: links met een {supportNames[supportTypes[0]]} en rechts met een {supportNames[supportTypes[1]]}. Deze balk wordt van buitenaf belast met een {loadProperties.isForce ? 'kracht' : 'moment'}.</Par>
		<Diagram isInputField={false} />
		<Par>Teken het vrijlichaamsschema/schematisch diagram.</Par>
		<InputSpace>
			<Diagram id="loads" isInputField={true} showSupports={false} />
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { A } = useSolution()
			return <>
				<Par>Schematiseer de bevestiging links: teken de bijbehorende reactiekrachten/momenten.</Par>
				<InputSpace>
					<Diagram id="loadsLeft" isInputField={true} showSupports={false} zoom={A} />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { A, supportTypes } = useSolution()
			return <>
				<Par>{supportExplanation[supportTypes[0]]} Hiermee vinden we de onderstaande schematisering.</Par>
				<Diagram showSolution={true} showSupports={false} zoom={A} />
			</>
		},
	},
	{
		Problem: () => {
			const { B } = useSolution()
			return <>
				<Par>Schematiseer de bevestiging rechts: teken de bijbehorende reactiekrachten/momenten.</Par>
				<InputSpace>
					<Diagram id="loadsRight" isInputField={true} showSupports={false} zoom={B} />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { B, supportTypes } = useSolution()
			return <>
				<Par>{supportExplanation[supportTypes[1]]} Hiermee vinden we de onderstaande schematisering.</Par>
				<Diagram showSolution={true} showSupports={false} zoom={B} />
			</>
		},
	},
	{
		Problem: () => {
			return <>
				<Par>Teken de schematisering links, de schematisering rechts en de externe belasting allemaal in één figuur.</Par>
				<InputSpace>
					<Diagram id="loads" isInputField={true} showSupports={false} />
				</InputSpace>
			</>
		},
		Solution: () => {
			return <>
				<Par>We tekenen de schematisering van de twee bevestigingen (richting maakt niet uit) en de externe belasting (richting maakt wel uit) in één figuur. Zo krijgen we het onderstaande.</Par>
				<Diagram showSolution={true} showSupports={false} />
				<Par>Merk op dat je in een vrijlichaamsschema/schematisch diagram de bevestigingen normaliter <em>niet</em> tekent, maar afstanden die relevant zijn <em>wel</em>.</Par>
			</>
		},
	},
]

function getFeedback(exerciseData) {
	const { input, solution } = exerciseData

	return {
		loads: input.loads && getCustomFBDFeedback(input.loads, solution.loads, FBDComparison, solution.A, solution.B),
		...getInputFieldFeedback(['loadsLeft', 'loadsRight'], exerciseData, { feedbackFunction: (input, solution) => getFBDFeedback(input, solution, FBDComparison) }),
	}
}

function getCustomFBDFeedback(input, solution, comparison, A, B) {
	// Derive feedback on the loads. This is custom feedback, so no function is called for it. It is determined straight from the matching.
	const matching = getLoadMatching(input, solution, comparison)

	// Check if any input loads are not matched.
	const unmatchedInputLoads = input.filter((_, index) => matching.input[index].length === 0)
	if (unmatchedInputLoads.length > 0) {
		return {
			correct: false,
			text: unmatchedInputLoads.length === 1 ? 'Er is een pijl getekend die niet aanwezig hoort te zijn. Kijk daar eerst naar.' : `Er zijn ${getCountingWord(unmatchedInputLoads.length)} pijlen getekend die niet aanwezig horen te zijn. Kijk daar eerst naar.`,
			affectedLoads: unmatchedInputLoads,
		}
	}

	// Check if any solution load is matched to multiple input loads.
	const doubleInputLoads = matching.solution.filter(matches => matches.length > 1)
	if (doubleInputLoads.length >= 1) {
		return {
			correct: false,
			text: `${doubleInputLoads.length === 1 ? `Er is een set` : `Er zijn ${getCountingWord(doubleInputLoads.length)} sets`} pijlen die op hetzelfde neerkomen. Haal overbodige pijlen weg.`,
			affectedLoads: doubleInputLoads.flat(),
		}
	}

	// Check if solution loads are not matched.
	const missingLoads = solution.filter((_, index) => matching.solution[index].length === 0)
	if (missingLoads.length >= 1) {
		// Try to find a point matching a missing arrow.
		const isAtA = isLoadAtPoint(missingLoads[0], A)
		const isAtB = isLoadAtPoint(missingLoads[0], B)
		const description = (isAtA ? 'linker' : 'rechter')
		if (isAtA || isAtB)
			return { correct: false, text: `${missingLoads.length === 1 ? `Er is nog een ontbrekende pijl. Kijk eens goed naar de ${description} bevestiging.` : `Er zijn nog ontbrekende pijlen. Kijk eerst eens goed naar de ${description} bevestiging.`}`, }
		return { correct: false, text: `Vergeet de externe belasting niet mee te nemen.` }
	}

	// All is correct!
	return { correct: true, text: selectRandomCorrect() }
}

function Diagram({ isInputField = false, id, showSupports = true, showSolution = false, zoom = undefined }) {
	const solution = useSolution()
	const { points, loads } = solution

	// Define the transformation.
	const transformationSettings = useScaleBasedTransformationSettings(zoom || points, { scale: 70, margin: [80, [80, 100]] })

	// Get all the required components.
	let loadsToDisplay = isInputField ? [] : (showSolution ? loads : loads.filter(load => load.source === loadSources.external))
	if (zoom)
		loadsToDisplay = loadsToDisplay.filter(load => isLoadAtPoint(load, zoom))
	const schematics = <Schematics loads={loadsToDisplay} showSupports={showSupports} zoom={zoom} />

	// Set up either a diagram or an input field with said diagram.
	const snappers = points
	return isInputField ?
		<FBDInput id={id} transformationSettings={transformationSettings} snappers={snappers} validate={allConnectedToPoints(points)}>{schematics}</FBDInput> :
		<Drawing transformationSettings={transformationSettings}>{schematics}</Drawing>
}

function Schematics({ loads, showSupports = true, zoom }) {
	const { supportTypes, A, B, points, isAEnd, isBEnd } = useSolution()
	const background = useCurrentBackgroundColor()
	const distanceLabelStyle = { background, padding: '0.3rem' }

	const SupportLeft = (isAEnd ? endSupportObjects : midSupportObjects)[supportTypes[0]]
	const SupportRight = (isBEnd ? endSupportObjects : midSupportObjects)[supportTypes[1]]

	return <>
		<Group overflow={false}><Beam points={points} /></Group>

		{!zoom || zoom.equals(A) ? <SupportLeft position={A} angle={isAEnd ? Math.PI : Math.PI / 2} style={{ opacity: showSupports ? 1 : 0.1 }} /> : null}
		{!zoom || zoom.equals(B) ? <SupportRight position={B} angle={isBEnd ? 0 : Math.PI / 2} style={{ opacity: showSupports ? 1 : 0.1 }} /> : null}

		{points.map((point, index) => {
			if (zoom)
				return null
			const prev = points[index - 1]
			if (index === 0 || prev.equals(point))
				return null
			return <Fragment key={index}>
				<Element position={point.interpolate(prev)} graphicalPosition={new Vector(0, distanceShift)} anchor={[0.5, 0.5]} style={distanceLabelStyle}><M>{new FloatUnit(`${point.x - prev.x}m`)}</M></Element>
				<Distance span={{ start: prev, end: point }} graphicalShift={new Vector(0, distanceShift)} />
			</Fragment>
		})}

		{render(loads)}
	</>
}
