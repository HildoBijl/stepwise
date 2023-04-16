import React from 'react'

import { Vector } from 'step-wise/geometry'

import { Par, M, BM } from 'ui/components'
import { Drawing, drawingComponents, LineLabel, useRotationReflectionTransformation, useScaleToBoundsTransformationSettings } from 'ui/components/figures'
import ExpressionInput, { numeric, basicMathAndPowers } from 'ui/form/inputs/ExpressionInput'
import EquationInput, { validWithVariables } from 'ui/form/inputs/EquationInput'
import { InputSpace } from 'ui/form/FormPart'

import { useExerciseData } from '../ExerciseContainer'
import { useSolution } from '../util/SolutionProvider'
import StepExercise from '../types/StepExercise'

import { getInputFieldFeedback } from '../util/feedback'

const { Polygon, RightAngle } = drawingComponents

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const solution = useSolution()
	const { La, Lb, Lc, x, y, z } = solution

	return <>
		<Par>De onderstaande driehoek met zijde <M>{z}</M> is gelijkvormig met een <M>\left({La},{Lb},{Lc}\right)</M> driehoek. Vind de onbekende zijden <M>{x}</M> en <M>{y}.</M></Par>
		<ExerciseFigure />
		<InputSpace>
			<ExpressionInput id="ans1" prelabel={<M>{x}=</M>} size="s" settings={basicMathAndPowers} validate={numeric} />
			<ExpressionInput id="ans2" prelabel={<M>{y}=</M>} size="s" settings={basicMathAndPowers} validate={numeric} />
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { x, z } = useSolution()
			return <>
				<Par>Bekijk als eerste zijde <M>{x}.</M> Stel een vergelijking op waar zowel de bekende zijde <M>{z}</M> als de onbekende zijde <M>{x}</M> in voorkomen.</Par>
				<InputSpace>
					<EquationInput id="equation1" settings={basicMathAndPowers} validate={validWithVariables(x)} />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { x, z, equation1 } = useSolution()
			return <Par>Gelijkvormigheid betekent dat de verhouding tussen corresponderende zijden constant is. Als we kijken naar de zijden met <M>{z}</M> en <M>{x},</M> dan volgt <BM>{equation1}.</BM></Par>
		},
	},
	{
		Problem: () => {
			const { x } = useSolution()
			return <>
				<Par>Los deze vergelijking op voor <M>{x}.</M></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans1" prelabel={<M>{x}=</M>} size="s" settings={basicMathAndPowers} validate={numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { x, ans1Raw, ans1 } = useSolution()
			return <Par>De oplossing volgt direct als <BM>{x} = {ans1Raw} = {ans1}.</BM></Par>
		},
	},
	{
		Problem: () => {
			const { y, z } = useSolution()
			return <>
				<Par>Bekijk vervolgens zijde <M>{y}.</M> Stel een vergelijking op waar zowel de bekende zijde <M>{z}</M> als de onbekende zijde <M>{y}</M> in voorkomen.</Par>
				<InputSpace>
					<EquationInput id="equation2" settings={basicMathAndPowers} validate={validWithVariables(y)} />
				</InputSpace>
			</>
		},
		Solution: () => {
			const { y, z, equation2 } = useSolution()
			return <Par>Gelijkvormigheid betekent dat de verhouding tussen corresponderende zijden constant is. Als we kijken naar de zijden met <M>{z}</M> en <M>{y},</M> dan volgt <BM>{equation2}.</BM></Par>
		},
	},
	{
		Problem: () => {
			const { y } = useSolution()
			return <>
				<Par>Los deze vergelijking op voor <M>{y}.</M></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans2" prelabel={<M>{y}=</M>} size="s" settings={basicMathAndPowers} validate={numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: () => {
			const { y, ans2Raw, ans2 } = useSolution()
			return <Par>De oplossing volgt direct als <BM>{y} = {ans2Raw} = {ans2}.</BM></Par>
		},
	},
]

function getFeedback(exerciseData) {
	return getInputFieldFeedback(['equation1', 'ans1', 'equation2', 'ans2'], exerciseData)
}

function ExerciseFigure() {
	const { state } = useExerciseData()
	const solution = useSolution()
	const { triangle1, triangle2 } = getPoints(solution)
	const { rotation, reflection, La, Lb, Lc } = solution

	// Define the transformation.
	const pretransformation = useRotationReflectionTransformation(rotation, reflection)
	const transformationSettings = useScaleToBoundsTransformationSettings([...triangle1, ...triangle2], {
		pretransformation,
		maxWidth: 300,
		maxHeight: 300,
		margin: 20,
	})

	// Render the figure.
	return <Drawing transformationSettings={transformationSettings} svgContents={<>
		<Polygon points={triangle1} style={{ fill: '#aaccff' }} />
		<RightAngle points={triangle1} />
		<Polygon points={triangle2} style={{ fill: '#ffffff' }} />
		<RightAngle points={triangle2} graphicalSize={6} />
	</>} htmlContents={<>
		<LineLabel points={[triangle1[0], triangle1[1]]} oppositeTo={triangle1[2]}><M>{state.a}</M></LineLabel>
		<LineLabel points={[triangle1[1], triangle1[2]]} oppositeTo={triangle1[0]}><M>{state.b}</M></LineLabel>
		<LineLabel points={[triangle1[0], triangle1[2]]} oppositeTo={triangle1[1]}><M>{state.c}</M></LineLabel>

		<LineLabel points={[triangle2[0], triangle2[1]]} oppositeTo={triangle2[2]} graphicalDistance={4}><M>{La}</M></LineLabel>
		<LineLabel points={[triangle2[1], triangle2[2]]} oppositeTo={triangle2[0]} graphicalDistance={4}><M>{Lb}</M></LineLabel>
		<LineLabel points={[triangle2[0], triangle2[2]]} oppositeTo={triangle2[1]} graphicalDistance={4}><M>{Lc}</M></LineLabel>
	</>} />
}

function getPoints(solution) {
	const { a, b } = solution
	const shiftFactor = 0.7
	const sizeFactor = 0.3
	const triangle2Start = new Vector(a.number * shiftFactor, b.number * shiftFactor)
	return {
		triangle1: [
			new Vector(a.number, 0),
			new Vector(0, 0),
			new Vector(0, b.number),
		],
		triangle2: [
			triangle2Start.add(new Vector(a.number * sizeFactor, 0)),
			triangle2Start,
			triangle2Start.add(new Vector(0, b.number * sizeFactor)),
		],
	}
}
