import React from 'react'

import { Vector } from 'step-wise/geometry'

import { Translation, Check } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { Drawing, Polygon, RightAngle, LineLabel, useRotationReflectionTransformation, useBoundsBasedTransformationSettings } from 'ui/figures'
import { InputSpace } from 'ui/form'
import { ExpressionInput, EquationInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const solution = useSolution()
	const { x } = solution

	return <>
		<Par><Translation>Given the triangle below, determine the unknown side <M>{x}</M>.</Translation></Par>
		<ExerciseFigure state={state} solution={solution} />
		<InputSpace>
			<ExpressionInput id="ans" prelabel={<M>{x}=</M>} size="s" settings={ExpressionInput.settings.basicMathAndPowers} validate={ExpressionInput.validation.numeric} />
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: ({ a, b, c }) => {
			const { x } = useSolution()
			return <>
				<Par><Translation>Through the Pythagorean therom, set up an equation linking the three sides of the triangle. Use the values <M>{a}</M>, <M>{b}</M> and <M>{c}</M>.</Translation></Par>
				<InputSpace>
					<EquationInput id="equation" settings={EquationInput.settings.basicMathAndPowers} validate={EquationInput.validation.validWithVariables(x)} />
				</InputSpace>
			</>
		},
		Solution: ({ a, b, c, toFind, x, equation }) => {
			return <Par><Translation>We have the two legs <M>{toFind === 0 ? x : a}</M> and <M>{toFind === 1 ? x : b}</M> and the hypothenuse <M>{toFind === 2 ? x : c}</M>. The Pythagorean theorem now directly states that <BM>{equation}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { x } = useSolution()
			return <>
				<Par><Translation>Solve these equation first for <M>{x}^2</M>.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ansSquared" prelabel={<M>{x}^2=</M>} size="s" settings={ExpressionInput.settings.basicMathAndPowers} validate={ExpressionInput.validation.numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ x, ansSquared, ansSquaredSimplified }) => {
			return <Par><Translation>We can directly find that <BM>{x}^2 = {ansSquared}.</BM> This can then still be simplified to <BM>{x}^2 = {ansSquaredSimplified}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { x } = useSolution()
			return <>
				<Par><Translation>Determine based on <M>{x}^2</M> the value of <M>{x}</M>.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{x}=</M>} size="s" settings={ExpressionInput.settings.basicMathAndPowers} validate={ExpressionInput.validation.numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ x, ansRaw, ans, ansCanBeSimplified }) => {
			return <Par><Translation>We take the square root of both sides of the equation. This gives us <BM>{x} = {ansRaw}.</BM> Note that, since we know that the requested distance is positive, we do not need to add a <M>\pm</M> here. <Check value={ansCanBeSimplified}><Check.True>Optionally, the above result can still be simplified to <BM>{x} = {ans}.</BM></Check.True><Check.False>The above result cannot be simplified further.</Check.False></Check></Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	return getFieldInputFeedback(exerciseData, ['equation', 'ansSquared', 'ans'])
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
