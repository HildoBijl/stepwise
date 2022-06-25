import React from 'react'

import { Vector, Line } from 'step-wise/geometry'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import { Drawing } from 'ui/components/figures'
import { components, PositionedElement, rotateAndReflect, scaleToBounds, getCornerLabelPosition } from 'ui/components/figures'
import ExpressionInput, { validAndNumeric, basicMath } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/Status'

import { useSolution } from '../ExerciseContainer'
import StepExercise from '../types/StepExercise'

import { getInputFieldFeedback } from '../util/feedback'

const { Polygon, Line: LineComponent } = components

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const solution = useSolution(state)
	const { variables } = solution

	return <>
		<Par>Twee parallelle lijnen omsluiten twee driehoeken. Bereken hoek <M>{variables.gamma}</M> in graden.</Par>
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
			return <Par>De som van de hoeken van een driehoek is <M>180^\circ.</M> Voor de blauwe driehoek geeft dit de vergelijking <BM>{variables.alpha} + 90^\circ + {a}^\circ = 180^\circ.</BM> Dit oplossen voor <M>{variables.alpha}</M> resulteert in <BM>{variables.alpha} = 180^\circ - 90^\circ - {a}^\circ = {alpha}^\circ.</BM></Par>
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
			return <Par>Vanuit het principe van Z-hoeken zien we dat <BM>{variables.beta} = {variables.alpha} = {beta}^\circ.</BM></Par>
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
			return <Par>De som van de hoeken van een driehoek is <M>180^\circ.</M> Voor de rode driehoek geeft dit de vergelijking <BM>{variables.gamma} + {beta} + {b}^\circ = 180^\circ.</BM> Dit oplossen voor <M>{variables.gamma}</M> resulteert in <BM>{variables.gamma} = 180^\circ - {beta}^\circ - {b}^\circ = {gamma}^\circ.</BM></Par>
		},
	},
]

function getFeedback(exerciseData) {
	return getInputFieldFeedback(['alpha', 'beta', 'gamma'], exerciseData)
}

function ExerciseFigure({ solution, showAlpha = 0, showBeta = 0, showGamma = 0 }) {
	const rawPoints = getPoints(solution)
	const { variables, rotation, reflect, a, b, c, alpha, beta, gamma } = solution

	// Define settings.
	const maxWidth = 360
	const maxHeight = 300
	const labelScale = 1.3
	const labelLetterSize = 14
	const labelNumberSize = 20
	const figureMargin = 20

	// Process points.
	const rotatedPoints = rotateAndReflect(rawPoints, rotation, reflect)
	const { points, bounds } = scaleToBounds(rotatedPoints, maxWidth, maxHeight, figureMargin)
	const { bottomLeft, bottomRight, topLeft, topRight } = points

	// Define data for drawing the two parallel lines.
	const linePoints = [[bottomLeft, bottomRight], [topLeft, topRight]]

	// Render the figure.
	return <Drawing maxWidth={bounds.width} width={bounds.width} height={bounds.height} svgContents={
		<>
			<Polygon points={[bottomLeft, topRight, bottomRight]} style={{ fill: '#aaccff' }} />
			<Polygon points={[topLeft, bottomLeft, topRight]} style={{ fill: '#ffaabb' }} />
			{linePoints.map((points, index) => {
				const line = Line.fromPoints(...points)
				const linePart = bounds.getLinePart(line)
				return <LineComponent key={index} points={[linePart.start, linePart.end]} style={{ strokeWidth: 2 }} />
			})}
		</>
	} htmlContents={
		<>
			{showAlpha === 0 ? null : <PositionedElement position={getCornerLabelPosition([topRight, bottomLeft, bottomRight], labelLetterSize)} scale={labelScale}>{showAlpha === 1 ? <M>{variables.alpha}</M> : <M>{alpha}^\circ</M>}</PositionedElement>}
			{showBeta === 0 ? null : <PositionedElement position={getCornerLabelPosition([bottomLeft, topRight, topLeft], labelLetterSize)} scale={labelScale}>{showBeta === 1 ? <M>{variables.beta}</M> : <M>{beta}^\circ</M>}</PositionedElement>}
			{showGamma === 0 ? null : <PositionedElement position={getCornerLabelPosition([topRight, topLeft, bottomLeft], labelLetterSize)} scale={labelScale}>{showGamma === 1 ? <M>{variables.gamma}</M> : <M>{gamma}^\circ</M>}</PositionedElement>}

			<PositionedElement position={getCornerLabelPosition([bottomLeft, bottomRight, topRight], labelNumberSize)} scale={labelScale}><M>{a}^\circ</M></PositionedElement>
			<PositionedElement position={getCornerLabelPosition([bottomLeft, topRight, bottomRight], labelNumberSize)} scale={labelScale}><M>{b}^\circ</M></PositionedElement>
			<PositionedElement position={getCornerLabelPosition([topLeft, bottomLeft, topRight], labelNumberSize)} scale={labelScale}><M>{c}^\circ</M></PositionedElement>
		</>
	} />
}

function getPoints(solution) {
	const { a, b, c, alpha, gamma } = solution

	// Determine points in the drawing.
	const bottomLeft = new Vector(0, 0)
	const topRight = Vector.fromPolar(1, -alpha * Math.PI / 180)
	const bottomRight = new Vector(Math.sin(b * Math.PI / 180) / Math.sin(a * Math.PI / 180), 0)
	const topLeft = topRight.subtract(new Vector(Math.sin(c * Math.PI / 180) / Math.sin(gamma * Math.PI / 180), 0))

	// Return everything together.
	return { bottomLeft, bottomRight, topLeft, topRight }
}