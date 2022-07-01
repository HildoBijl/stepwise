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

const { Circle, Line: LineComponent, RightAngle } = components

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = (state) => {
	const solution = useSolution(state)
	const { a, variables } = solution

	return <>
		<Par>Twee kruisende lijnen raken een cirkel aan weerszijden. De gegeven hoek bij het middelpunt van de cirkel is <M>{a}^\circ.</M> Bereken hoek <M>{variables.delta}</M> in graden.</Par>
		<ExerciseFigure solution={solution} showDelta={1} />
		<InputSpace>
			<ExpressionInput id="delta" prelabel={<M>{variables.delta}=</M>} size="s" settings={basicMath} validate={validAndNumeric} />
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
			const { variables, alpha } = useSolution(state)
			return <Par>Een raaklijn op een cirkel staat altijd loodrecht ten opzichte van de straal. Deze hoek moet dus <M>{variables.alpha} = {alpha}^\circ</M> zijn.</Par>
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
			const { variables, a, beta } = useSolution(state)
			return <Par>De som van de hoeken van een driehoek is <M>180^\circ.</M> Dit geeft de vergelijking <M>{a}^\circ + 90^\circ + {variables.beta} = 180^\circ.</M> Dit oplossen voor <M>{variables.beta}</M> resulteert in <BM>{variables.beta} = 180^\circ - {a}^\circ - 90^\circ = {beta}^\circ.</BM></Par>
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
			const { variables, gamma } = useSolution(state)
			return <Par>Dit kunnen we bepalen vanuit symmetrie. Vanaf het middelpunt van de cirkel gezien zijn de twee raaklijnen identiek (slechts gespiegeld) en dus is de hoek tussen de betreffende lijnen ook hetzelfde. Er geldt dus dat <BM>{variables.gamma} = {variables.beta} = {gamma}^\circ.</BM></Par>
		},
	},
	{
		Problem: (state) => {
			const solution = useSolution(state)
			const { variables } = solution
			return <>
				<Par>Bepaal de hoek <M>{variables.delta}</M> uit de onderstaande figuur.</Par>
				<ExerciseFigure solution={solution} showAlpha={2} showBeta={2} showGamma={2} showDelta={1} />
				<InputSpace>
					<Par>
						<ExpressionInput id="delta" prelabel={<M>{variables.delta}=</M>} size="s" settings={basicMath} validate={validAndNumeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: (state) => {
			const { variables, beta, gamma, delta } = useSolution(state)
			return <Par>De som van de hoeken van een driehoek is <M>180^\circ.</M> Voor de grote driehoek met hoek <M>{variables.delta}</M> geeft dit de vergelijking <BM>{variables.delta} + 90^\circ + {beta}^\circ + {gamma}^\circ = 180^\circ.</BM> Dit oplossen voor <M>{variables.delta}</M> resulteert in <BM>{variables.delta} = 180^\circ - 90^\circ - {beta}^\circ - {gamma}^\circ = {delta}^\circ.</BM></Par>
		},
	},
]

function getFeedback(exerciseData) {
	return getInputFieldFeedback(['alpha', 'beta', 'gamma', 'delta'], exerciseData)
}

function ExerciseFigure({ solution, showAlpha = 0, showBeta = 0, showGamma = 0, showDelta = 0 }) {
	const rawPoints = getPoints(solution)
	const { variables, rotation, reflect, a, beta, gamma, delta } = solution

	// Define settings.
	const maxWidth = 360
	const maxHeight = 360
	const labelScale = 1.3
	const labelLetterSize = 14
	const labelNumberSize = 20
	const margin = 0

	// Process points.
	const rotatedPoints = rotateAndReflect(rawPoints, rotation, reflect)
	const { points, bounds } = scaleToBounds(rotatedPoints, { maxWidth, maxHeight, margin })
	const { top, center, right, bottom } = points
	const radius = top.subtract(center).magnitude

	// Define data for drawing the two crossing lines.
	const linePoints = [[top, right], [bottom, right]]

	// Render the figure.
	return <Drawing maxWidth={bounds.width} width={bounds.width} height={bounds.height} svgContents={
		<>
			<Circle center={center} radius={radius} style={{ fill: '#aaccff', stroke: '#888888' }} />
			<LineComponent points={[top, bottom]} />
			<LineComponent points={[right, center]} />
			{linePoints.map((points, index) => {
				const line = Line.fromPoints(...points)
				const linePart = bounds.getLinePart(line)
				return <LineComponent key={index} points={[linePart.start, linePart.end]} style={{ strokeWidth: 2 }} />
			})}
			{showAlpha === 2 ? <RightAngle points={[center, top, right]} /> : null}
			<Circle center={center} radius={radius / 40} style={{ fill: 'black' }} />
		</>
	} htmlContents={
		<>
			{showAlpha === 1 ? <PositionedElement position={getCornerLabelPosition([center, top, right], labelLetterSize)} scale={labelScale}><M>{variables.alpha}</M></PositionedElement> : null}
			{showBeta === 0 ? null : <PositionedElement position={getCornerLabelPosition([top, right, center], labelLetterSize)} scale={labelScale}>{showBeta === 1 ? <M>{variables.beta}</M> : <M>{beta}^\circ</M>}</PositionedElement>}
			{showGamma === 0 ? null : <PositionedElement position={getCornerLabelPosition([bottom, right, center], labelLetterSize)} scale={labelScale}>{showGamma === 1 ? <M>{variables.gamma}</M> : <M>{gamma}^\circ</M>}</PositionedElement>}
			{showDelta === 0 ? null : <PositionedElement position={getCornerLabelPosition([right, bottom, top], labelLetterSize)} scale={labelScale}>{showDelta === 1 ? <M>{variables.delta}</M> : <M>{delta}^\circ</M>}</PositionedElement>}

			<PositionedElement position={getCornerLabelPosition([right, center, top], labelNumberSize)} scale={labelScale}><M>{a}^\circ</M></PositionedElement>
		</>
	} />
}

function getPoints(solution) {
	const { a, beta, gamma } = solution

	// Determine points in the drawing.
	const l = 1 * Math.tan(a * Math.PI / 180)
	const top = new Vector(0, 0)
	const center = new Vector(0, 1)
	const topLeft = new Vector(-1, 0) // Present for positioning.
	const bottomLeft = new Vector(-1, 2) // Present for positioning.
	const right = new Vector(l, 0)
	const bottom = new Vector(0, l * Math.tan((beta + gamma) * Math.PI / 180))

	// Return everything together.
	return { top, center, topLeft, bottomLeft, right, bottom }
}