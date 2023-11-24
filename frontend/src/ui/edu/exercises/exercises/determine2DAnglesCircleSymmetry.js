import React from 'react'

import { Vector, Line } from 'step-wise/geometry'

import { Par, M, BM } from 'ui/components'
import { Drawing, Circle, BoundedLine, Line as SvgLine, RightAngle, CornerLabel, useRotationReflectionTransformation, useBoundsBasedTransformationSettings } from 'ui/figures'
import { InputSpace } from 'ui/form'
import { ExpressionInput } from 'ui/inputs'

import { useSolution } from 'ui/eduTools'
import StepExercise from '../types/StepExercise'

import { getInputFieldFeedback } from '../util/feedback'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { a, variables } = useSolution()
	return <>
		<Par>Twee kruisende lijnen raken een cirkel aan weerszijden. We tekenen een lijn vanaf het ene raakpunt door het middelpunt van de cirkel. De gegeven hoek bij het middelpunt van de cirkel is <M>{a}^\circ.</M> Bereken hoek <M>{variables.delta}</M> in graden.</Par>
		<ExerciseFigure showDelta={1} />
		<InputSpace>
			<ExpressionInput id="delta" prelabel={<M>{variables.delta}=</M>} size="s" settings={ExpressionInput.settings.basicMath} validate={ExpressionInput.validation.numeric} />
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
					<ExpressionInput id="alpha" prelabel={<M>{variables.alpha}=</M>} size="s" settings={ExpressionInput.settings.basicMath} validate={ExpressionInput.validation.numeric} />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { variables, alpha } = useSolution()
			return <Par>Een raaklijn op een cirkel staat altijd loodrecht ten opzichte van de straal. Deze hoek moet dus <M>{variables.alpha} = {alpha}^\circ</M> zijn.</Par>
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
						<ExpressionInput id="beta" prelabel={<M>{variables.beta}=</M>} size="s" settings={ExpressionInput.settings.basicMath} validate={ExpressionInput.validation.numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { variables, a, beta } = useSolution()
			return <Par>De som van de hoeken van een driehoek is <M>180^\circ.</M> Dit geeft de vergelijking <M>{a}^\circ + 90^\circ + {variables.beta} = 180^\circ.</M> Dit oplossen voor <M>{variables.beta}</M> resulteert in <BM>{variables.beta} = 180^\circ - {a}^\circ - 90^\circ = {beta}^\circ.</BM></Par>
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
						<ExpressionInput id="gamma" prelabel={<M>{variables.gamma}=</M>} size="s" settings={ExpressionInput.settings.basicMath} validate={ExpressionInput.validation.numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { variables, gamma } = useSolution()
			return <Par>Dit kunnen we bepalen vanuit symmetrie. Vanaf het middelpunt van de cirkel gezien zijn de twee raaklijnen identiek (slechts gespiegeld) en dus is de hoek tussen de betreffende lijnen ook hetzelfde. Er geldt dus dat <BM>{variables.gamma} = {variables.beta} = {gamma}^\circ.</BM></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par>Bepaal de hoek <M>{variables.delta}</M> uit de onderstaande figuur.</Par>
				<ExerciseFigure showAlpha={2} showBeta={2} showGamma={2} showDelta={1} />
				<InputSpace>
					<Par>
						<ExpressionInput id="delta" prelabel={<M>{variables.delta}=</M>} size="s" settings={ExpressionInput.settings.basicMath} validate={ExpressionInput.validation.numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { variables, beta, gamma, delta } = useSolution()
			return <Par>De som van de hoeken van een driehoek is <M>180^\circ.</M> Voor de grote driehoek met hoek <M>{variables.delta}</M> geeft dit de vergelijking <BM>{variables.delta} + 90^\circ + {beta}^\circ + {gamma}^\circ = 180^\circ.</BM> Dit oplossen voor <M>{variables.delta}</M> resulteert in <BM>{variables.delta} = 180^\circ - 90^\circ - {beta}^\circ - {gamma}^\circ = {delta}^\circ.</BM></Par>
		},
	},
]

function getFeedback(exerciseData) {
	return getInputFieldFeedback(['alpha', 'beta', 'gamma', 'delta'], exerciseData)
}

function ExerciseFigure({ showAlpha = 0, showBeta = 0, showGamma = 0, showDelta = 0 }) {
	const solution = useSolution()
	const points = getPoints(solution)
	const { top, center, right, bottom } = points
	const { variables, rotation, reflection, a, beta, gamma, delta } = solution
	const radius = top.subtract(center).magnitude

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
		<Circle center={center} radius={radius} style={{ fill: '#aaccff', stroke: '#888888' }} />
		<SvgLine points={[top, bottom]} />
		<SvgLine points={[right, center]} />
		<BoundedLine line={Line.fromPoints(top, right)} style={{ strokeWidth: 2 }} />
		<BoundedLine line={Line.fromPoints(bottom, right)} style={{ strokeWidth: 2 }} />
		{showAlpha === 2 ? <RightAngle points={[center, top, right]} graphicalSize={10} /> : null}
		<Circle center={center} radius={radius / 40} style={{ fill: 'black' }} />

		{showAlpha === 1 ? <CornerLabel points={[center, top, right]} graphicalSize={labelLetterSize}><M>{variables.alpha}</M></CornerLabel> : null}
		{showBeta === 0 ? null : <CornerLabel points={[top, right, center]} graphicalSize={showBeta === 1 ? labelLetterSize : labelNumberSize}>{showBeta === 1 ? <M>{variables.beta}</M> : <M>{beta}^\circ</M>}</CornerLabel>}
		{showGamma === 0 ? null : <CornerLabel points={[bottom, right, center]} graphicalSize={showGamma === 1 ? labelLetterSize : labelNumberSize}>{showGamma === 1 ? <M>{variables.gamma}</M> : <M>{gamma}^\circ</M>}</CornerLabel>}
		{showDelta === 0 ? null : <CornerLabel points={[right, bottom, top]} graphicalSize={showDelta === 1 ? labelLetterSize : labelNumberSize}>{showDelta === 1 ? <M>{variables.delta}</M> : <M>{delta}^\circ</M>}</CornerLabel>}

		<CornerLabel points={[right, center, top]} graphicalSize={labelNumberSize}><M>{a}^\circ</M></CornerLabel>
	</Drawing>
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
