import React from 'react'

import { deg2rad, roundToDigits } from 'step-wise/util/numbers'
import { numberArray } from 'step-wise/util/arrays'
import { Vector } from 'step-wise/geometry'
import { Float } from 'step-wise/inputTypes/Float'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import { Drawing } from 'ui/components/figures'
import { components, LineLabel, useScaleAndShiftTransformationSettings, useRotationReflectionTransformation, useScaleToBoundsTransformationSettings } from 'ui/components/figures'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'
import ExpressionInput, { numeric, basicTrigonometryInDegrees } from 'ui/form/inputs/ExpressionInput'
import EquationInput, { validWithVariables } from 'ui/form/inputs/EquationInput'
import { useInput } from 'ui/form/Form'
import { InputSpace } from 'ui/form/FormPart'

import EngineeringDiagram, { Group, Beam, FixedSupport, RollerHingeSupport, Distance, PositionedElement, Label, CornerLabel, LoadLabel, render } from 'ui/edu/content/mechanics/EngineeringDiagram'
import FBDInput, { allConnectedToPoints, getFBDFeedback, loadSources, performLoadsComparison } from 'ui/edu/content/mechanics/FBDInput'

import { useExerciseData } from '../ExerciseContainer'
import { useSolution } from '../util/SolutionProvider'
import StepExercise from '../types/StepExercise'
import { hasIncorrectSide } from '../util/feedbackChecks/equation'

import { getInputFieldFeedback, getMCFeedback } from '../util/feedback'

const { Polygon } = components

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	return <>
		<Par>Een balk is ingeklemd in een muur, zoals hieronder weergegeven.</Par>
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
					<MultipleChoice id="part1" choices={[
						<>Ja. Een inklemming voorkomt beweging loodrecht op de muur. Dus is er een reactiekracht die die beweging voorkomt.</>,
						<>Ja. Een inklemming laat beweging loodrecht op de muur toe. Dus is er een reactiekracht die die beweging voorkomt.</>,
						<>Nee. Een inklemming voorkomt beweging loodrecht op de muur. Dus kan er geen reactiekracht zijn die die beweging voorkomt.</>,
						<>Nee. Een inklemming laat beweging loodrecht op de muur toe. Dus kan er geen reactiekracht zijn die die beweging voorkomt.</>,
					]} />
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
				<Par>Bepaal of je een reactiekracht loodrecht op het muuroppervlak moet tekenen.</Par>
				<InputSpace>
					<MultipleChoice id="part1" choices={[
						<>Ja. Een inklemming voorkomt beweging loodrecht op de muur. Dus is er een reactiekracht die die beweging voorkomt.</>,
						<>Ja. Een inklemming laat beweging loodrecht op de muur toe. Dus is er een reactiekracht die die beweging voorkomt.</>,
						<>Nee. Een inklemming voorkomt beweging loodrecht op de muur. Dus kan er geen reactiekracht zijn die die beweging voorkomt.</>,
						<>Nee. Een inklemming laat beweging loodrecht op de muur toe. Dus kan er geen reactiekracht zijn die die beweging voorkomt.</>,
					]} />
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
				<Par>Bepaal of je een reactiekracht loodrecht op het muuroppervlak moet tekenen.</Par>
				<InputSpace>
					<MultipleChoice id="part1" choices={[
						<>Ja. Een inklemming voorkomt beweging loodrecht op de muur. Dus is er een reactiekracht die die beweging voorkomt.</>,
						<>Ja. Een inklemming laat beweging loodrecht op de muur toe. Dus is er een reactiekracht die die beweging veroorzaakt.</>,
						<>Nee. Een inklemming voorkomt beweging loodrecht op de muur. Er is dus geen reactiekracht om de beweging te veroorzaken.</>,
						<>Nee. Een inklemming laat beweging loodrecht op de muur toe. Er is dus geen reactiekracht om de beweging te voorkomen.</>,
					]} />
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
			</>
		},
		Solution: () => {
			return <Par>ToDo</Par>
		},
	},
]

function getFeedback(exerciseData) {
	// ToDo
	return {}

	// // Determine MC feedback text in various cases.
	// const ruleText = [
	// 	<>Klopt. Er zijn slechts twee zijden betrokken, dus is de sinusregel de regel die we willen gebruiken.</>,
	// 	<>Nee. De cosinusregel is alleen te gebruiken indien je drie betrokken zijden hebt. Die hebben we hier niet.</>
	// ]
	// const numSolutionsText = [
	// 	<>Nee. Er is zeker wel een driehoek die voldoet aan de gegeven waarden. Deze is immers bij de opgave getekend.</>,
	// 	<>Inderdaad. Er is één driehoek die aan de gegeven waarden voldoet.</>,
	// 	<>Nee, er zijn geen twee driehoeken die aan de gegeven waarden voldoen. Als je vanaf de gegeven zijde de lijnen met de gegeven hoeken tekent, dan is er maar één snijpunt mogelijk.</>,
	// ]

	// // Set up feedback checks for the equation field.
	// const someSideNoFraction = (input, correct, solution, isCorrect) => !isCorrect && (!input.left.isSubtype('Fraction') || !input.right.isSubtype('Fraction')) && <>De sinusregel heeft aan beide kanten van de vergelijking een breuk. Dat is nu niet het geval.</>
	// const equationChecks = [someSideNoFraction, hasIncorrectSide]

	// return {
	// 	...getMCFeedback('rule', exerciseData, { text: ruleText }),
	// 	...getMCFeedback('numSolutions', exerciseData, { text: numSolutionsText }),
	// 	...getInputFieldFeedback(['γ', 'equation', 'a'], exerciseData, [[], equationChecks, []].map(feedbackChecks => ({ feedbackChecks }))),
	// }
}

function Diagram({ isInputField = false, showSupports = true, showSolution = false }) {
	const solution = useSolution()
	const { points, wallRotation, beamRotation } = solution

	// Define the transformation.
	const transformationSettings = useScaleAndShiftTransformationSettings(points, { scale: 70, margin: 120 })

	// Get all the required components.
	const loadsToDisplay = [] // isInputField ? [] : (showSolution ? loads : loads.filter(load => load.source === loadSources.external))
	const schematics = <Schematics {...solution} showSupports={showSupports} loads={loadsToDisplay} />
	const elements = <Elements {...solution} loads={loadsToDisplay} />

	// Set up either a diagram or an input field with said diagram.
	const snappers = [] //[...Object.values(points), Line.fromPointAndAngle(points.B, deg2rad(theta))]
	return isInputField ?
		<FBDInput id="loads" transformationSettings={transformationSettings} svgContents={schematics} htmlContents={elements} snappers={snappers} validate={allConnectedToPoints(points)} maxWidth={bounds => bounds.width} /> :
		<EngineeringDiagram transformationSettings={transformationSettings} svgContents={schematics} htmlContents={elements} maxWidth={bounds => bounds.width} />
}

function Schematics({ points, loads, fixA, showSupports = true }) {
	const { wallRotation, beamRotation } = useSolution()

	// ToDo next: apply mask to group.
	return <>
		<Group overflow={false}>
			<Beam points={[Vector.zero, Vector.fromPolar(3, deg2rad(wallRotation + beamRotation + 180))]} />
		</Group>

		<Group style={{ opacity: showSupports ? 1 : 0.1 }}>
			<FixedSupport position={points[0]} angle={deg2rad(wallRotation)} />
		</Group>

		<Group>{render(loads)}</Group>
	</>
}

function Elements({ }) {
	return <>

	</>
}
