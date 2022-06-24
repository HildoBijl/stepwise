import React from 'react'

import { Vector } from 'step-wise/geometry'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import { Drawing } from 'ui/components/figures'
import { components, PositionedElement, rotateAndReflect, scaleToBounds, getCornerLabelPosition } from 'ui/components/figures'
import ExpressionInput, { validAndNumeric, basicMath } from 'ui/form/inputs/ExpressionInput'
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
	const { variables } = solution

	return <>
		<Par>Gegeven de onderstaande figuur, bereken hoek <M>{variables.gamma}</M> in graden.</Par>
		<ExerciseFigure solution={solution} showGamma={1} />
		<InputSpace>
			<ExpressionInput id="gamma" prelabel={<M>{variables.gamma}=</M>} size="s" settings={basicMath} validate={validAndNumeric} />
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: (state) => {
			const solution = useSolution(state)
			const { variables } = solution
			return <>
				<Par>Bepaal de hoek <M>{variables.alpha}</M> uit de onderstaande figuur.</Par>
				<ExerciseFigure solution={solution} showAlpha={1} />
				<InputSpace>
					<ExpressionInput id="alpha" prelabel={<M>{variables.alpha}=</M>} size="s" settings={basicMath} validate={validAndNumeric} />
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { variables, a, alpha } = useSolution(state)
			return <Par>De som van de hoeken van een driehoek is <M>180^\circ.</M> Dit geeft de vergelijking <BM>{variables.alpha} + 90^\circ + {a}^\circ = 180^\circ.</BM> Dit oplossen voor <M>{variables.alpha}</M> resulteert in <BM>{variables.alpha} = 180^\circ - 90^\circ - {a}^\circ = {alpha}^\circ.</BM></Par>
		},
	},
	{
		Problem: (state) => {
			const solution = useSolution(state)
			const { variables } = solution
			return <>
				<Par>Bepaal de hoek <M>{variables.beta}</M> uit de onderstaande figuur.</Par>
				<ExerciseFigure solution={solution} showAlpha={2} showBeta={1} />
				<InputSpace>
					<Par>
						<ExpressionInput id="beta" prelabel={<M>{variables.beta}=</M>} size="s" settings={basicMath} validate={validAndNumeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { variables, beta } = useSolution(state)
			return <Par>Vanuit het principe van X-hoeken zien we dat <BM>{variables.beta} = {variables.alpha} = {beta}^\circ.</BM></Par>
		},
	},
	{
		Problem: (state) => {
			const solution = useSolution(state)
			const { variables } = solution
			return <>
				<Par>Bepaal de hoek <M>{variables.gamma}</M> uit de onderstaande figuur.</Par>
				<ExerciseFigure solution={solution} showAlpha={2} showBeta={2} showGamma={1} />
				<InputSpace>
					<Par>
						<ExpressionInput id="gamma" prelabel={<M>{variables.gamma}=</M>} size="s" settings={basicMath} validate={validAndNumeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { variables, b, beta, gamma } = useSolution(state)
			return <Par>De som van de hoeken van een driehoek is <M>180^\circ.</M> Dit geeft de vergelijking <BM>{variables.gamma} + {variables.beta} + {b}^\circ = 180^\circ.</BM> Dit oplossen voor <M>{variables.gamma}</M> resulteert in <BM>{variables.gamma} = 180^\circ - {variables.beta} - {b}^\circ = 180^\circ - {beta}^\circ - {b}^\circ = {gamma}^\circ.</BM></Par>
		},
	},
]

function getFeedback(exerciseData) {
	return getInputFieldFeedback(['alpha', 'beta', 'gamma'], exerciseData)
}

function ExerciseFigure({ solution, showAlpha = 0, showBeta = 0, showGamma = 0 }) {
	const rawPoints = getPoints(solution)
	const { variables, rotation, reflect, a, b, alpha, beta, gamma } = solution

	// Define settings.
	const maxWidth = 360
	const maxHeight = 300
	const labelScale = 1.3
	const labelLetterSize = 14
	const labelNumberSize = 20

	// Process points.
	const rotatedPoints = rotateAndReflect(rawPoints, rotation, reflect)
	const { points, width, height } = scaleToBounds(rotatedPoints, maxWidth, maxHeight, rotation, reflect)
	const { middle, right, topRight, left, bottomLeft } = points

	// Render the figure.
	return <Drawing maxWidth={width} width={width} height={height} svgContents={
		<>
			<Polygon points={[left, bottomLeft, middle]} style={{ fill: '#ff8899' }} />
			<Polygon points={[right, topRight, middle]} style={{ fill: '#88aaff' }} />
			<RightAngle points={[middle, right, topRight]} />
		</>
	} htmlContents={
		<>
			{showAlpha === 0 ? null : <PositionedElement position={getCornerLabelPosition([right, middle, topRight], labelLetterSize)} scale={labelScale}>{showAlpha === 1 ? <M>{variables.alpha}</M> : <M>{alpha}^\circ</M>}</PositionedElement>}
			{showBeta === 0 ? null : <PositionedElement position={getCornerLabelPosition([left, middle, bottomLeft], labelLetterSize)} scale={labelScale}>{showBeta === 1 ? <M>{variables.beta}</M> : <M>{beta}^\circ</M>}</PositionedElement>}
			{showGamma === 0 ? null : <PositionedElement position={getCornerLabelPosition([left, bottomLeft, middle], labelLetterSize)} scale={labelScale}>{showGamma === 1 ? <M>{variables.gamma}</M> : <M>{gamma}^\circ</M>}</PositionedElement>}

			<PositionedElement position={getCornerLabelPosition([right, topRight, middle], labelNumberSize)} scale={labelScale}><M>{a}^\circ</M></PositionedElement>
			<PositionedElement position={getCornerLabelPosition([bottomLeft, left, middle], labelNumberSize)} scale={labelScale}><M>{b}^\circ</M></PositionedElement>
		</>
	} />
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