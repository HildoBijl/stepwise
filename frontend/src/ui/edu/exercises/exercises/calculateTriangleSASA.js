import React from 'react'

import { deg2rad, roundToDigits } from 'step-wise/util/numbers'
import { numberArray } from 'step-wise/util/arrays'
import { Vector } from 'step-wise/geometry'
import { Float } from 'step-wise/inputTypes/Float'

import { Par, M, BM } from 'ui/components'
import { Drawing, drawingComponents, CornerLabel, LineLabel, useRotationReflectionTransformation, useScaleToBoundsTransformationSettings } from 'ui/components/figures'
import MultipleChoice from 'ui/form/inputs/MultipleChoice'
import ExpressionInput, { numeric, validWithVariables, basicTrigonometryInDegrees } from 'ui/form/inputs/ExpressionInput'
import { useInput } from 'ui/form/Form'
import { InputSpace } from 'ui/form/FormPart'

import { useExerciseData } from '../ExerciseContainer'
import { useSolution } from '../util/SolutionProvider'
import StepExercise from '../types/StepExercise'

import { getInputFieldFeedback, getMCFeedback } from '../util/feedback'

const { Polygon } = drawingComponents

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const { α, β, b, c } = state
	const numSolutions = useInput('numSolutions')
	return <>
		<Par>Gegeven is een driehoek met zijden van <M>{b}</M> en <M>{c}.</M> De hoek tussen deze zijden is <M>{α}^\circ.</M> Bereken de hoek <M>{β}</M> tegenover de zijde van <M>{b}.</M> Vind alle mogelijke oplossingen en geef je antwoord in wiskundige notatie.</Par>
		<ExerciseFigure showβ={true} />
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
			const { a } = state
			const numSolutions = useInput('numSolutions')
			return <>
				<Par>Bepaal de resterende zijde <M>{a}.</M></Par>
				<ExerciseFigure showa={true} showβ={true} />
				<InputSpace>
					<MultipleChoice id="numSolutions" choices={[
						<>Er zijn geen oplossingen voor <M>{a}</M>.</>,
						<>Er is één oplossing voor <M>{a}</M>.</>,
						<>Er zijn twee oplossingen voor <M>{a}</M>.</>,
					]} />
					{numSolutions ? <Par>
						{numberArray(1, numSolutions).map(index => <ExpressionInput key={index} id={`a${numSolutions > 1 ? index : ''}`} prelabel={<M>{a}{numSolutions > 1 ? `_${index}` : ''}=</M>} size="m" settings={basicTrigonometryInDegrees} validate={numeric} persistent={true} />)}
					</Par> : null}
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { equation1Raw, equation1, a } = useSolution()
			return <>
				<Par>Als eerste bepalen we dat er voor dit probleem slechts één mogelijke driehoek is. Als we een hoek met twee aanliggende zijden weten, dan staat de gehele driehoek vast.</Par>
				<Par>De zijde <M>{state.a}</M> kan vervolgens gevonden worden met de cosinusregel. Er zijn immers drie zijden bij dit probleem betrokken. Zo vinden we <BM>{equation1Raw}.</BM> Dit kan vereenvoudigd worden tot <BM>{equation1}.</BM> We lossen <M>{state.a}</M> op door de wortel van beide kanten te nemen. Het resultaat is <BM>{state.a} = {a}.</BM></Par>
			</>
		},
	},
	{
		Problem: (state) => {
			const { β, a } = state
			return <>
				<Par>Druk <M>{β}</M> uit in <M>{a}.</M> Oftewel, los <M>{β}</M> op alsof <M>{a}</M> bekend is, maar vul de zojuist gevonden waarde voor <M>{a}</M> nog <em>niet</em> in.</Par>
				<InputSpace>
					<ExpressionInput id="βRaw" prelabel={<M>{β}=</M>} size="m" settings={basicTrigonometryInDegrees} validate={validWithVariables(a)} />
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { equation2Raw, equation2, intermediateEquation, βRaw } = useSolution()
			return <>
				<Par>We kunnen hier zowel de sinusregel als de cosinusregel toepassen. De sinusregel is iets minder handig, omdat we bij hoeken groter dan <M>90^\circ</M> dan mogelijk de verkeerde uitkomst krijgen. We zouden dan handmatig moeten controleren of <M>{state.β}</M> groter of kleiner dan <M>{90}^\circ</M> is. Bij de cosinusregel treedt dit probleem niet op. Dus passen we de cosinusregel toe.</Par>
				<Par>Letterlijk zegt de cosinusregel dat <BM>{equation2Raw}.</BM> Vereenvoudigd kunnen we dit schrijven als <BM>{equation2}.</BM> Dit willen we oplossen voor <M>{state.β}.</M> Als eerste lossen we <M>{intermediateEquation.left}</M> op als <BM>{intermediateEquation}.</BM> Via de omgekeerde cosinus volgt vervolgens dat <BM>{state.β} = {βRaw}.</BM></Par>
			</>
		},
	},
	{
		Problem: (state) => {
			const { β, a } = state
			return <>
				<Par>Vul op de plek van <M>{a}</M> de eerder gevonden oplossing in.</Par>
				<InputSpace>
					<ExpressionInput id="β" prelabel={<M>{β}=</M>} size="m" settings={basicTrigonometryInDegrees} validate={validWithVariables(a)} />
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { a, β } = useSolution()
			return <>
				<Par>We vervangen <M>{state.a}</M> letterlijk voor <M>{a}.</M> Zo krijgen we (licht vereenvoudigd) de uitkomst <BM>{state.β} = {β}.</BM> Dit komt overeen met een hoek van <M>{state.β} \approx {new Float(roundToDigits(β.number, 3))}^\circ</M> wat lijkt te kloppen met de afbeelding.</Par>
			</>
		},
	},
]

function getFeedback(exerciseData) {
	// Determine MC feedback text in various cases.
	const numSolutionsText = [
		<>Nee. Er is zeker wel een driehoek die voldoet aan de gegeven waarden. Deze is immers bij de opgave getekend.</>,
		<>Inderdaad. Er is één driehoek die aan de gegeven waarden voldoet.</>,
		<>Nee, er zijn geen twee driehoeken die aan de gegeven waarden voldoen. Als je bij een driehoek de hoek en de twee aanliggende zijden weet, dan staat de gehele driehoek vast.</>,
	]

	// No feedback rules have been implemented.

	return {
		...getMCFeedback('numSolutions', exerciseData, { text: numSolutionsText }),
		...getInputFieldFeedback(['a', 'βRaw', 'β'], exerciseData, [[], [], []].map(feedbackChecks => ({ feedbackChecks }))),
	}
}

function ExerciseFigure({ showa, showβ }) {
	const { state } = useExerciseData()
	const solution = useSolution()
	const points = getPoints(solution)
	const { rotation, reflection, α, β, a, b, c } = state

	// Define the transformation.
	const pretransformation = useRotationReflectionTransformation(rotation, reflection)
	const transformationSettings = useScaleToBoundsTransformationSettings(points, {
		pretransformation,
		maxWidth: 300,
		maxHeight: 300,
		margin: 20,
	})
	const labelSize = 30

	// Render the figure.
	return <Drawing transformationSettings={transformationSettings} svgContents={<>
		<Polygon points={points} style={{ fill: '#aaccff' }} />
	</>} htmlContents={<>
		<LineLabel points={[points[0], points[1]]} oppositeTo={points[2]}><M>{c}</M></LineLabel>
		{showa ? <LineLabel points={[points[1], points[2]]} oppositeTo={points[0]}><M>{a}</M></LineLabel> : null}
		<LineLabel points={[points[2], points[0]]} oppositeTo={points[1]}><M>{b}</M></LineLabel>
		<CornerLabel points={[points[2], points[0], points[1]]} graphicalSize={labelSize}><M>{α}^\circ</M></CornerLabel>
		{showβ ? <CornerLabel points={[points[0], points[1], points[2]]} graphicalSize={labelSize}><M>{β}</M></CornerLabel> : null}
	</>} />
}

function getPoints(solution) {
	const { b, c, α } = solution
	const αRad = deg2rad(α.number)
	return [
		new Vector(0, 0),
		new Vector(c.number, 0),
		new Vector(b.number * Math.cos(αRad), b.number * Math.sin(αRad)),
	]
}
