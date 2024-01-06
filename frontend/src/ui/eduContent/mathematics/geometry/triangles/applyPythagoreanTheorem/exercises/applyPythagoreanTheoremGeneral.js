import React from 'react'

import { Vector } from 'step-wise/geometry'

import { Par, M, BM } from 'ui/components'
import { Drawing, Polygon, RightAngle, LineLabel, useRotationReflectionTransformation, useBoundsBasedTransformationSettings } from 'ui/figures'
import { InputSpace } from 'ui/form'
import { ExpressionInput, EquationInput } from 'ui/inputs'
import { useSolution, StepExercise, getInputFieldFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const solution = useSolution()
	const { x } = solution

	return <>
		<Par>Gegeven is de onderstaande driehoek. Vind de onbekende zijde <M>{x}.</M></Par>
		<ExerciseFigure state={state} solution={solution} />
		<InputSpace>
			<ExpressionInput id="ans" prelabel={<M>{x}=</M>} size="s" settings={ExpressionInput.settings.basicMathAndPowers} validate={ExpressionInput.validation.numeric} />
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: (state) => {
			const { a, b, c } = state
			const { x } = useSolution()
			return <>
				<Par>Stel via de stelling van Pythagoras een vergelijking op voor de zijden van de driehoek. Gebruik de waarden <M>{a},</M> <M>{b}</M> en <M>{c}.</M></Par>
				<InputSpace>
					<EquationInput id="equation" settings={EquationInput.settings.basicMathAndPowers} validate={EquationInput.validation.validWithVariables(x)} />
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { a, b, c } = state
			const { equation } = useSolution()
			return <Par>We hebben hier rechte zijden <M>{a}</M> en <M>{b}</M> en schuine zijde <M>{c}.</M> De stelling van Pythagoras zegt nu direct dat <BM>{equation}.</BM></Par>
		},
	},
	{
		Problem: () => {
			const { x } = useSolution()
			return <>
				<Par>Los deze vergelijking eerst op voor <M>{x}^2.</M></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ansSquared" prelabel={<M>{x}^2=</M>} size="s" settings={ExpressionInput.settings.basicMathAndPowers} validate={ExpressionInput.validation.numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ x, ansSquared, ansSquaredSimplified }) => {
			return <Par>We kunnen direct vinden dat <BM>{x}^2 = {ansSquared}.</BM> Dit kan vervolgens nog vereenvoudigd worden tot <BM>{x}^2 = {ansSquaredSimplified}.</BM></Par>
		},
	},
	{
		Problem: () => {
			const { x } = useSolution()
			return <>
				<Par>Bepaal vanuit <M>{x}^2</M> de waarde van <M>{x}.</M></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{x}=</M>} size="s" settings={ExpressionInput.settings.basicMathAndPowers} validate={ExpressionInput.validation.numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ x, ansRaw, ans, ansCanBeSimplified }) => {
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
	const transformationSettings = useBoundsBasedTransformationSettings(points, {
		pretransformation,
		maxWidth: 300,
		maxHeight: 300,
		margin: 20,
	})

	// Render the figure.
	return <Drawing transformationSettings={transformationSettings}>
		<Polygon points={points} style={{ fill: '#aaccff' }} />
		<RightAngle points={points} graphicalSize={10} />
		<LineLabel points={[points[0], points[1]]} oppositeTo={points[2]}><M>{state.a}</M></LineLabel>
		<LineLabel points={[points[1], points[2]]} oppositeTo={points[0]}><M>{state.b}</M></LineLabel>
		<LineLabel points={[points[0], points[2]]} oppositeTo={points[1]}><M>{state.c}</M></LineLabel>
	</Drawing>
}

function getPoints(solution) {
	const { a, b } = solution
	return [
		new Vector(a.number, 0),
		new Vector(0, 0),
		new Vector(0, b.number),
	]
}
