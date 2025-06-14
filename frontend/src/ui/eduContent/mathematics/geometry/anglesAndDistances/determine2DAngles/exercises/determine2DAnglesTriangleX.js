import React from 'react'

import { Vector, Line } from 'step-wise/geometry'

import { Par, M, BM } from 'ui/components'
import { Drawing, BoundedLine, Polygon, RightAngle, CornerLabel, useRotationReflectionTransformation, useBoundsBasedTransformationSettings } from 'ui/figures'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables } = useSolution()
	return <>
		<Par>Twee kruisende lijnen begrenzen twee driehoeken. Bereken hoek <M>{variables.gamma}</M> in graden.</Par>
		<ExerciseFigure showGamma={1} />
		<InputSpace>
			<ExpressionInput id="gamma" prelabel={<M>{variables.gamma}=</M>} size="s" settings={ExpressionInput.settings.withFractions} validate={ExpressionInput.validation.numeric} />
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par>Bepaal de hoek <M>{variables.alpha}</M> uit de onderstaande figuur.</Par>
				<ExerciseFigure showAlpha={1} />
				<InputSpace>
					<ExpressionInput id="alpha" prelabel={<M>{variables.alpha}=</M>} size="s" settings={ExpressionInput.settings.withFractions} validate={ExpressionInput.validation.numeric} />
				</InputSpace>
			</>
		},
		Solution: ({ variables, a, alpha }) => {
			return <Par>De som van de hoeken van een driehoek is <M>180^\circ.</M> Voor de blauwe driehoek geeft dit de vergelijking <BM>{variables.alpha} + 90^\circ + {a}^\circ = 180^\circ.</BM> Dit oplossen voor <M>{variables.alpha}</M> resulteert in <BM>{variables.alpha} = 180^\circ - 90^\circ - {a}^\circ = {alpha}^\circ.</BM></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par>Bepaal de hoek <M>{variables.beta}</M> uit de onderstaande figuur.</Par>
				<ExerciseFigure showAlpha={2} showBeta={1} />
				<InputSpace>
					<Par>
						<ExpressionInput id="beta" prelabel={<M>{variables.beta}=</M>} size="s" settings={ExpressionInput.settings.withFractions} validate={ExpressionInput.validation.numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, beta }) => {
			return <Par>Vanuit het principe van X-hoeken zien we dat <BM>{variables.beta} = {variables.alpha} = {beta}^\circ.</BM></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par>Bepaal de hoek <M>{variables.gamma}</M> uit de onderstaande figuur.</Par>
				<ExerciseFigure showAlpha={2} showBeta={2} showGamma={1} />
				<InputSpace>
					<Par>
						<ExpressionInput id="gamma" prelabel={<M>{variables.gamma}=</M>} size="s" settings={ExpressionInput.settings.withFractions} validate={ExpressionInput.validation.numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, b, beta, gamma }) => {
			return <Par>De som van de hoeken van een driehoek is <M>180^\circ.</M> Voor de rode driehoek geeft dit de vergelijking <BM>{variables.gamma} + {beta} + {b}^\circ = 180^\circ.</BM> Dit oplossen voor <M>{variables.gamma}</M> resulteert in <BM>{variables.gamma} = 180^\circ - {beta}^\circ - {b}^\circ = {gamma}^\circ.</BM></Par>
		},
	},
]

function getFeedback(exerciseData) {
	return getFieldInputFeedback(exerciseData, ['alpha', 'beta', 'gamma'])
}

function ExerciseFigure({ showAlpha = 0, showBeta = 0, showGamma = 0 }) {
	const solution = useSolution()
	const points = getPoints(solution)
	const { middle, right, topRight, left, bottomLeft } = points
	const { variables, rotation, reflection, a, b, alpha, beta, gamma } = solution

	// Define settings.
	const size = 300
	const labelLetterSize = 22
	const labelNumberSize = 30

	// Define the transformation.
	const pretransformation = useRotationReflectionTransformation(rotation, reflection)
	const transformationSettings = useBoundsBasedTransformationSettings(points, {
		pretransformation,
		maxWidth: size,
		maxHeight: size,
		margin: 20,
	})

	// Render the figure.
	return <Drawing transformationSettings={transformationSettings}>
		<Polygon points={[right, topRight, middle]} style={{ fill: '#aaccff' }} />
		<Polygon points={[left, bottomLeft, middle]} style={{ fill: '#ffaabb' }} />
		<BoundedLine line={Line.fromPoints(left, right)} style={{ strokeWidth: 2 }} />
		<BoundedLine line={Line.fromPoints(bottomLeft, topRight)} style={{ strokeWidth: 2 }} />
		<RightAngle points={[middle, right, topRight]} graphicalSize={10} />

		{showAlpha === 0 ? null : <CornerLabel points={[right, middle, topRight]} graphicalSize={showAlpha === 1 ? labelLetterSize : labelNumberSize}>{showAlpha === 1 ? <M>{variables.alpha}</M> : <M>{alpha}^\circ</M>}</CornerLabel>}
		{showBeta === 0 ? null : <CornerLabel points={[left, middle, bottomLeft]} graphicalSize={showBeta === 1 ? labelLetterSize : labelNumberSize}>{showBeta === 1 ? <M>{variables.beta}</M> : <M>{beta}^\circ</M>}</CornerLabel>}
		{showGamma === 0 ? null : <CornerLabel points={[left, bottomLeft, middle]} graphicalSize={showGamma === 1 ? labelLetterSize : labelNumberSize}>{showGamma === 1 ? <M>{variables.gamma}</M> : <M>{gamma}^\circ</M>}</CornerLabel>}

		<CornerLabel points={[right, topRight, middle]} graphicalSize={labelNumberSize}><M>{a}^\circ</M></CornerLabel>
		<CornerLabel points={[bottomLeft, left, middle]} graphicalSize={labelNumberSize}><M>{b}^\circ</M></CornerLabel>
	</Drawing>
}

function getPoints(solution) {
	const { b, alpha, beta, gamma } = solution

	// Determine points in the drawing. First do the right triangle.
	const middle = new Vector(0, 0)
	const topRight = Vector.fromPolar(1, -alpha * Math.PI / 180)
	const right = new Vector(topRight.x, 0)

	// Then do the left triangle.
	const horizontalDistance = (gamma >= b ? 1 : Math.sin(gamma * Math.PI / 180) / Math.sin(b * Math.PI / 180))
	const diagonalDistance = (gamma <= b ? 1 : Math.sin(b * Math.PI / 180) / Math.sin(gamma * Math.PI / 180))
	const left = new Vector(-horizontalDistance, 0)
	const bottomLeft = Vector.fromPolar(diagonalDistance, Math.PI - beta * Math.PI / 180)

	// Return everything together.
	return { middle, right, topRight, left, bottomLeft }
}
