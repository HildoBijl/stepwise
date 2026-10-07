import React from 'react'

import { Transformation, Vector } from '@step-wise/geometry'
import { M, BM } from '@step-wise/math-display'

import { Par } from 'ui/components'
import { Drawing, Polygon, RightAngle, LineLabel } from '@step-wise/drawing'
import { InputSpace } from 'ui/form'
import { ExpressionInput, EquationInput } from 'ui/inputs'
import { StepExercise, useExerciseData, useSolution, getFieldInputFeedback } from 'ui/eduTools'

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
			<ExpressionInput id="ans1" prelabel={<M>{x}=</M>} size="s" settings={ExpressionInput.settings.withRoots} validate={ExpressionInput.validation.numeric} />
			<ExpressionInput id="ans2" prelabel={<M>{y}=</M>} size="s" settings={ExpressionInput.settings.withRoots} validate={ExpressionInput.validation.numeric} />
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
					<EquationInput id="equation1" settings={EquationInput.settings.withRoots} validate={EquationInput.validation.validWithVariables(x)} />
				</InputSpace>
			</>
		},
		Solution: ({ x, z, equation1 }) => {
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
						<ExpressionInput id="ans1" prelabel={<M>{x}=</M>} size="s" settings={ExpressionInput.settings.withRoots} validate={ExpressionInput.validation.numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ x, ans1Raw, ans1 }) => {
			return <Par>De oplossing volgt direct als <BM>{x} = {ans1Raw} = {ans1}.</BM></Par>
		},
	},
	{
		Problem: () => {
			const { y, z } = useSolution()
			return <>
				<Par>Bekijk vervolgens zijde <M>{y}.</M> Stel een vergelijking op waar zowel de bekende zijde <M>{z}</M> als de onbekende zijde <M>{y}</M> in voorkomen.</Par>
				<InputSpace>
					<EquationInput id="equation2" settings={EquationInput.settings.withRoots} validate={EquationInput.validation.validWithVariables(y)} />
				</InputSpace>
			</>
		},
		Solution: ({ y, z, equation2 }) => {
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
						<ExpressionInput id="ans2" prelabel={<M>{y}=</M>} size="s" settings={ExpressionInput.settings.withRoots} validate={ExpressionInput.validation.numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ y, ans2Raw, ans2 }) => {
			return <Par>De oplossing volgt direct als <BM>{y} = {ans2Raw} = {ans2}.</BM></Par>
		},
	},
]

function getFeedback(exerciseData) {
	return getFieldInputFeedback(exerciseData, ['equation1', 'ans1', 'equation2', 'ans2'])
}

function ExerciseFigure() {
	const { parameters } = useExerciseData()
	const solution = useSolution()
	const { triangle1, triangle2 } = getPoints(solution)
	const { rotation, reflection, La, Lb, Lc } = solution

	// Define the transformation.
	let pretransform = Transformation.fromRotation(rotation)
	if (reflection) pretransform = Transformation.fromHyperplaneReflection(Vector.getUnitVector(0, 2)).then(pretransform)

	// Render the figure.
	return <Drawing view={{ type: 'fit', points: [...triangle1, ...triangle2], pretransform, maxWidth: 300, maxHeight: 300, margin: 20 }}>
		<Polygon positions={triangle1} style={{ fill: '#aaccff' }} />
		<RightAngle positions={triangle1} size={{ pixelDistance: 10 }} />

		<LineLabel positions={[triangle1[0], triangle1[1]]} oppositeTo={triangle1[2]}><M>{parameters.a}</M></LineLabel>
		<LineLabel positions={[triangle1[1], triangle1[2]]} oppositeTo={triangle1[0]}><M>{parameters.b}</M></LineLabel>
		<LineLabel positions={[triangle1[0], triangle1[2]]} oppositeTo={triangle1[1]}><M>{parameters.c}</M></LineLabel>

		<Polygon positions={triangle2} style={{ fill: '#ffffff' }} />
		<RightAngle positions={triangle2} size={{ pixelDistance: 6 }} />

		<LineLabel positions={[triangle2[0], triangle2[1]]} oppositeTo={triangle2[2]} distance={{ pixelDistance: 4 }}><M>{La}</M></LineLabel>
		<LineLabel positions={[triangle2[1], triangle2[2]]} oppositeTo={triangle2[0]} distance={{ pixelDistance: 4 }}><M>{Lb}</M></LineLabel>
		<LineLabel positions={[triangle2[0], triangle2[2]]} oppositeTo={triangle2[1]} distance={{ pixelDistance: 4 }}><M>{Lc}</M></LineLabel>
	</Drawing>
}

function getPoints(solution) {
	const { La, Lb } = solution
	const shiftFactor = 0.7
	const sizeFactor = 0.3
	const triangle2Start = new Vector(La.toNumber() * shiftFactor, Lb.toNumber() * shiftFactor)
	return {
		triangle1: [
			new Vector(La.toNumber(), 0),
			new Vector(0, 0),
			new Vector(0, Lb.toNumber()),
		],
		triangle2: [
			triangle2Start.add(new Vector(La.toNumber() * sizeFactor, 0)),
			triangle2Start,
			triangle2Start.add(new Vector(0, Lb.toNumber() * sizeFactor)),
		],
	}
}
