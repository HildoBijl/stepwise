import React from 'react'

import { Vector } from 'step-wise/geometry'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import { Drawing } from 'ui/components/figures'
import { components, LineLabel, useRotationReflectionTransformation, useScaleToBoundsTransformationSettings } from 'ui/components/figures'
import ExpressionInput, { validAndNumeric, basicMathAndPowers } from 'ui/form/inputs/ExpressionInput'
import EquationInput, { validWithVariables } from 'ui/form/inputs/EquationInput'
import { InputSpace } from 'ui/form/Status'

import { useSolution } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'

import { getInputFieldFeedback } from '../util/feedback'

const { Polygon, RightAngle } = components

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const solution = useSolution(state)
	const { x } = solution

	return <>
		<Par>Gegeven is de onderstaande driehoek. Vind de onbekende zijde <M>{x}.</M></Par>
		<ExerciseFigure state={state} solution={solution} />
		<InputSpace>
			<ExpressionInput id="ans" prelabel={<M>{x}=</M>} size="s" settings={basicMathAndPowers} validate={validAndNumeric} />
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: (state) => {
			const solution = useSolution(state)
			const { x } = solution
			return <>
				<Par>Stel via de stelling van Pythagoras een vergelijking op voor de zijden van de driehoek.</Par>
				<InputSpace>
					<EquationInput id="equation" settings={basicMathAndPowers} validate={validWithVariables(x)} />
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { equation } = useSolution(state)
			return <Par>We hebben hier rechte zijden <M>{state.a}</M> en <M>{state.b}</M> en schuine zijde <M>{state.c}.</M> De stelling van Pythagoras zegt nu direct dat <BM>{equation}.</BM></Par>
		},
	},
	{
		Problem: (state) => {
			const solution = useSolution(state)
			const { x } = solution
			return <>
				<Par>Los deze vergelijking eerst op voor <M>{x}^2.</M></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ansSquared" prelabel={<M>{x}^2=</M>} size="s" settings={basicMathAndPowers} validate={validAndNumeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { x, ansSquared, ansSquaredSimplified } = useSolution(state)
			return <Par>We kunnen direct vinden dat <BM>{x}^2 = {ansSquared}.</BM> Dit kan vervolgens nog vereenvoudigd worden tot <BM>{x}^2 = {ansSquaredSimplified}.</BM></Par>
		},
	},
	{
		Problem: (state) => {
			const solution = useSolution(state)
			const { x } = solution
			return <>
				<Par>Bepaal vanuit <M>{x}^2</M> de waarde van <M>{x}.</M></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{x}=</M>} size="s" settings={basicMathAndPowers} validate={validAndNumeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { x, ansRaw, ans, ansCanBeSimplified } = useSolution(state)
			return <Par>We nemen van beide kanten van de vergelijking de wortel. Zo vinden we <BM>{x} = {ansRaw}.</BM> Merk op dat, omdat we weten dat de gevraagde afstand positief is, we hier geen <M>\pm</M> bij hoeven te plaatsen. {ansCanBeSimplified ? <>Eventueel kan het bovenstaande nog vereenvoudigd worden tot <BM>{x} = {ans}.</BM></> : <>Het bovenstaande kan niet nog verder vereenvoudigd worden.</>}</Par>
		},
	},
]

function getFeedback(exerciseData) {
	return getInputFieldFeedback(['equation', 'ansSquared', 'ans'], exerciseData)
}

function ExerciseFigure({ state, solution }) {
	const points = getPoints(solution)
	const { rotation, reflection } = solution

	// Define the transformation.
	const pretransformation = useRotationReflectionTransformation(rotation, reflection)
	const transformationSettings = useScaleToBoundsTransformationSettings(points, {
		pretransformation,
		maxWidth: 300,
		maxHeight: 300,
		margin: 20,
	})

	// Render the figure.
	return <Drawing transformationSettings={transformationSettings} maxWidth={bounds => bounds.width} svgContents={<>
		<Polygon points={points} style={{ fill: '#aaccff' }} />
		<RightAngle points={points} />
	</>} htmlContents={<>
		<LineLabel points={[points[0], points[1]]} oppositeTo={points[2]}><M>{state.a}</M></LineLabel>
		<LineLabel points={[points[1], points[2]]} oppositeTo={points[0]}><M>{state.b}</M></LineLabel>
		<LineLabel points={[points[0], points[2]]} oppositeTo={points[1]}><M>{state.c}</M></LineLabel>
	</>} />
}

function getPoints(solution) {
	const { a, b } = solution
	return [
		new Vector(a.number, 0),
		new Vector(0, 0),
		new Vector(0, b.number),
	]
}
