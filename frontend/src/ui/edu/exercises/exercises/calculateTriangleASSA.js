import React from 'react'

import { deg2rad, roundToDigits } from 'step-wise/util/numbers'
import { numberArray } from 'step-wise/util/arrays'
import { Integer } from 'step-wise/CAS'
import { Vector } from 'step-wise/geometry'
import { Float } from 'step-wise/inputTypes/Float'

import { Par, M, BM, BMList, BMPart } from 'ui/components'
import { Drawing, Polygon, CornerLabel, LineLabel, useRotationReflectionTransformation, useBoundsBasedTransformationSettings } from 'ui/figures'
import { useInput, InputSpace } from 'ui/form'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'
import ExpressionInput, { numeric, basicTrigonometryInDegrees } from 'ui/form/inputs/ExpressionInput'

import { useExerciseData } from '../ExerciseContainer'
import { useSolution } from '../util/SolutionProvider'
import StepExercise from '../types/StepExercise'

import { getInputFieldListFeedback, getMCFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { α, β, a, c } = state
	const numSolutions = useInput('numSolutions')
	return <>
		<Par>Gegeven is een driehoek met zijden van <M>{a}</M> en <M>{c}.</M> De hoek tegenover de zijde van <M>{a}</M> is <M>{α}^\circ.</M> Bereken de hoek <M>{β}</M> tussen de twee gegeven zijden. Vind alle mogelijke oplossingen en geef je antwoord in wiskundige notatie.</Par>
		<ExerciseFigure />
		<InputSpace>
			<MultipleChoice id="numSolutions" choices={[
				<>Er zijn geen oplossingen voor <M>{β}</M>.</>,
				<>Er is één oplossing voor <M>{β}</M>.</>,
				<>Er zijn twee oplossingen voor <M>{β}</M>.</>,
			]} />
			{numSolutions ? <Par>
				{numberArray(1, numSolutions).map(index => <ExpressionInput key={index} id={`β${numSolutions > 1 ? index : ''}`} prelabel={<M>{β}{numSolutions > 1 ? `_${index}` : ''}=</M>} size="m" settings={basicTrigonometryInDegrees} validate={numeric} persistent={true} />)}
			</Par> : null}
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: (state) => {
			const { γ } = state
			const numSolutions = useInput('numSolutions')
			return <>
				<Par>Bepaal alle mogelijke oplossingen voor de overige hoek <M>{γ}</M> van de driehoek.</Par>
				<ExerciseFigure showγ={true} />
				<InputSpace>
					<MultipleChoice id="numSolutions" choices={[
						<>Er zijn geen oplossingen voor <M>{γ}</M>.</>,
						<>Er is één oplossing voor <M>{γ}</M>.</>,
						<>Er zijn twee oplossingen voor <M>{γ}</M>.</>,
					]} />
					{numSolutions ? <Par>
						{numberArray(1, numSolutions).map(index => <ExpressionInput key={index} id={`γ${numSolutions > 1 ? index : ''}`} prelabel={<M>{γ}{numSolutions > 1 ? `_${index}` : ''}=</M>} size="m" settings={basicTrigonometryInDegrees} validate={numeric} persistent={true} />)}
					</Par> : null}
				</InputSpace>
			</>
		},
		Solution: () => {
			const { α, γ, a, c, equation, intermediateEquation, γ1 } = useSolution()
			return <Par>We kunnen de hoek <M>{γ}</M> direct vinden via de sinuswet, toegepast op zijden <M>{a}</M> en <M>{c}.</M> Tegenover zijde <M>{a}</M> is de hoek <M>{α}^\circ.</M> Tegenover zijde <M>{c}</M> staat hoek <M>{γ}.</M> De sinusregel zegt nu dat <BM>{equation}.</BM> Om deze vergelijking op te lossen isoleren we eerst <M>{intermediateEquation.left}.</M> Zo vinden we <BM>{intermediateEquation}.</BM> Als we de omgekeerde sinus op beide kanten toepassen, dan vinden we de eerste oplossing <BM>{γ}_1 = {γ1}.</BM> Dit is echter niet de enige oplossing. Bij het omkeren van een sinus moeten we ook altijd nog de tweede oplossing meenemen, zijnde <BM>{γ}_2 = 180 - {γ}_1 = 180 - {γ1}.</BM> Hiermee zijn de twee oplossingen voor <M>{γ}</M> bekend.</Par>
		},
	},
	{
		Problem: (state) => {
			const { β, γ } = state
			return <>
				<Par>Bepaal voor elke mogelijke waarde van <M>{γ}</M> de bijbehorende waarde van <M>{β}.</M></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="β1" prelabel={<M>{β}_1=</M>} size="m" settings={basicTrigonometryInDegrees} validate={numeric} />
						<ExpressionInput id="β2" prelabel={<M>{β}_2=</M>} size="m" settings={basicTrigonometryInDegrees} validate={numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { α, β, γ, γ1, γ2, β1, β2 } = useSolution()
			return <>
				<Par>De som van de hoeken van een driehoek is altijd <M>180^\circ.</M> Hiermee kunnen we direct <M>{β}_1</M> en <M>{β}_2</M> vinden als
					<BMList>
						<BMPart>{β}_1 = 180 - {α} - {γ}_1 = 180 - {α} - {γ1} = {new Integer(180).subtract(α).regularClean()} - {γ1},</BMPart>
						<BMPart>{β}_2 = 180 - {α} - {γ}_2 = 180 - {α} - \left({γ2}\right) = {γ1} - {α}.</BMPart>
					</BMList>
					Eventueel kunnen we deze twee oplossingen nog als getal uitrekenen. Zo krijgen we <M>{β}_1 \approx {new Float(roundToDigits(β1.number, 3))}^\circ</M> en <M>{state.β}_2 \approx {new Float(roundToDigits(β2.number, 3))}^\circ.</M> De bij de vraag getekende figuur is gebaseerd op <M>{β}_1.</M> We kunnen met <M>{β}_2</M> ook nog een driehoek tekenen. We krijgen dan de onderstaande afbeelding.</Par>
				<ExerciseFigure useAlternative={true} />
			</>
		},
	},
]

function getFeedback(exerciseData) {
	const { state } = exerciseData

	// Determine MC feedback text in various cases.
	const numSolutionsText = [
		<>Nee. Er is zeker wel een driehoek die voldoet aan de gegeven waarden. Deze is immers bij de opgave getekend.</>,
		<>Dit is niet correct. Kijk of je de lijn van <M>{state.a}</M> kan draaien richting de hoek van <M>{state.α}^\circ.</M> Is er nog een tweede driehoek mogelijk met de gegeven waarden?</>,
		<>Ja! Als we in de figuur de lijn van <M>{state.a}</M> draaien, richting de hoek van <M>{state.α}^\circ,</M> dan is er nog een tweede driehoek met de gegeven waarden te maken. De overige (onbekende) zijde is dan kleiner.</>,
	]

	// No feedback checks are defined.

	return {
		...getMCFeedback('numSolutions', exerciseData, { text: numSolutionsText }),
		...getInputFieldListFeedback(['γ1', 'γ2'], exerciseData),
		...getInputFieldListFeedback(['β1', 'β2'], exerciseData),
	}
}

function ExerciseFigure({ useAlternative, showγ }) {
	const { state } = useExerciseData()
	const solution = useSolution()
	const points = getPoints(solution, useAlternative)
	const { rotation, reflection, α, β, γ, a, c } = state

	// Define the transformation.
	const pretransformation = useRotationReflectionTransformation(rotation, reflection)
	const transformationSettings = useBoundsBasedTransformationSettings(points, {
		pretransformation,
		maxWidth: 300,
		maxHeight: 300,
		margin: 20,
	})
	const labelSize = 30

	// Render the figure.
	return <Drawing transformationSettings={transformationSettings}>
		<Polygon points={points} style={{ fill: '#aaccff' }} />
		<LineLabel points={[points[1], points[2]]} oppositeTo={points[0]}><M>{a}</M></LineLabel>
		<LineLabel points={[points[0], points[1]]} oppositeTo={points[2]}><M>{c}</M></LineLabel>
		<CornerLabel points={[points[2], points[0], points[1]]} graphicalSize={labelSize}><M>{α}^\circ</M></CornerLabel>
		{showγ ? <CornerLabel points={[points[1], points[2], points[0]]} graphicalSize={labelSize}><M>{γ}</M></CornerLabel> : null}
		<CornerLabel points={[points[0], points[1], points[2]]} graphicalSize={labelSize}><M>{β}</M></CornerLabel>
	</Drawing>
}

function getPoints(solution, useAlternative = false) {
	const { b1, b2, c, α } = solution
	const b = useAlternative ? b2 : b1
	const αRad = deg2rad(α.number)
	return [
		new Vector(0, 0),
		new Vector(c.number, 0),
		new Vector(b.number * Math.cos(αRad), b.number * Math.sin(αRad)),
	]
}
