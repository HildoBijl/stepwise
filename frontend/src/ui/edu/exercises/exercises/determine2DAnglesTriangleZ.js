import React from 'react'

import { Vector, Line } from 'step-wise/geometry'

import { M, BM } from 'ui/components/equations'
import { Par } from 'ui/components/containers'
import { Drawing } from 'ui/components/figures'
import { components, CornerLabel, useRotationReflectionTransformation, useScaleToBoundsTransformationSettings } from 'ui/components/figures'
import ExpressionInput, { numeric, basicMath } from 'ui/form/inputs/ExpressionInput'
import { InputSpace } from 'ui/form/FormPart'

import { useSolution } from '../util/SolutionProvider'
import StepExercise from '../types/StepExercise'

import { getInputFieldFeedback } from '../util/feedback'

const { Polygon, BoundedLine } = components

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables } = useSolution()
	return <>
		<Par>Twee parallelle lijnen omsluiten twee driehoeken. Bereken hoek <M>{variables.gamma}</M> in graden.</Par>
		<ExerciseFigure showGamma={1} />
		<InputSpace>
			<ExpressionInput id="gamma" prelabel={<M>{variables.gamma}=</M>} size="s" settings={basicMath} validate={numeric} />
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
					<ExpressionInput id="alpha" prelabel={<M>{variables.alpha}=</M>} size="s" settings={basicMath} validate={numeric} />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { variables, a, alpha } = useSolution()
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
						<ExpressionInput id="beta" prelabel={<M>{variables.beta}=</M>} size="s" settings={basicMath} validate={numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { variables, beta } = useSolution()
			return <Par>Vanuit het principe van Z-hoeken zien we dat <BM>{variables.beta} = {variables.alpha} = {beta}^\circ.</BM></Par>
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
						<ExpressionInput id="gamma" prelabel={<M>{variables.gamma}=</M>} size="s" settings={basicMath} validate={numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { variables, b, beta, gamma } = useSolution()
			return <Par>De som van de hoeken van een driehoek is <M>180^\circ.</M> Voor de rode driehoek geeft dit de vergelijking <BM>{variables.gamma} + {beta} + {b}^\circ = 180^\circ.</BM> Dit oplossen voor <M>{variables.gamma}</M> resulteert in <BM>{variables.gamma} = 180^\circ - {beta}^\circ - {b}^\circ = {gamma}^\circ.</BM></Par>
		},
	},
]

function getFeedback(exerciseData) {
	return getInputFieldFeedback(['alpha', 'beta', 'gamma'], exerciseData)
}

function ExerciseFigure({ showAlpha = 0, showBeta = 0, showGamma = 0 }) {
	const solution = useSolution()
	const points = getPoints(solution)
	const { bottomLeft, bottomRight, topLeft, topRight } = points
	const { variables, rotation, reflection, a, b, c, alpha, beta, gamma } = solution

	// Define settings.
	const size = 300
	const labelLetterSize = 22
	const labelNumberSize = 30

	// Define the transformation.
	const pretransformation = useRotationReflectionTransformation(rotation, reflection)
	const transformationSettings = useScaleToBoundsTransformationSettings(points, {
		pretransformation,
		maxWidth: size,
		maxHeight: size,
		margin: 20,
	})

	// Render the figure.
	return <Drawing transformationSettings={transformationSettings} maxWidth={bounds => bounds.width} svgContents={<>
		<Polygon points={[bottomLeft, topRight, bottomRight]} style={{ fill: '#aaccff' }} />
		<Polygon points={[topLeft, bottomLeft, topRight]} style={{ fill: '#ffaabb' }} />
		<BoundedLine line={Line.fromPoints(bottomLeft, bottomRight)} style={{ strokeWidth: 2 }} />
		<BoundedLine line={Line.fromPoints(topLeft, topRight)} style={{ strokeWidth: 2 }} />
	</>} htmlContents={<>
		{showAlpha === 0 ? null : <CornerLabel points={[topRight, bottomLeft, bottomRight]} graphicalSize={showAlpha === 1 ? labelLetterSize : labelNumberSize}>{showAlpha === 1 ? <M>{variables.alpha}</M> : <M>{alpha}^\circ</M>}</CornerLabel>}
		{showBeta === 0 ? null : <CornerLabel points={[bottomLeft, topRight, topLeft]} graphicalSize={showBeta === 1 ? labelLetterSize : labelNumberSize}>{showBeta === 1 ? <M>{variables.beta}</M> : <M>{beta}^\circ</M>}</CornerLabel>}
		{showGamma === 0 ? null : <CornerLabel points={[topRight, topLeft, bottomLeft]} graphicalSize={showGamma === 1 ? labelLetterSize : labelNumberSize}>{showGamma === 1 ? <M>{variables.gamma}</M> : <M>{gamma}^\circ</M>}</CornerLabel>}

		<CornerLabel points={[bottomLeft, bottomRight, topRight]} graphicalSize={labelNumberSize}><M>{a}^\circ</M></CornerLabel>
		<CornerLabel points={[bottomLeft, topRight, bottomRight]} graphicalSize={labelNumberSize}><M>{b}^\circ</M></CornerLabel>
		<CornerLabel points={[topLeft, bottomLeft, topRight]} graphicalSize={labelNumberSize}><M>{c}^\circ</M></CornerLabel>
	</>} />
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