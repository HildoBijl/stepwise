import React from 'react'

import { numberArray } from 'step-wise/util'

import { Translation } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace, useInput, selectRandomIncorrect } from 'ui/form'
import { MultipleChoice, ExpressionInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, getMCFeedback, CrossExerciseTranslation } from 'ui/eduTools'

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { x, equation } = useSolution()
	const numSolutions = useInput('numSolutions')
	return <>
		<Par><Translation>Consider the equation <BM>{equation}.</BM> Find all possible solutions for <M>{x}</M> and simplify them as much as possible. (This includes pulling factors out of roots and canceling factors within fractions.)</Translation></Par>
		<InputSpace>
			<NumSolutionsInput />
			{numSolutions ? <Par>
				{numberArray(1, numSolutions).map(index => <ExpressionInput key={index} id={`ans${index}`} prelabel={<M>{x}_{index}=</M>} size="l" settings={ExpressionInput.settings.numericWithRoots} validate={ExpressionInput.validation.numeric} persistent={true} />
				)}
			</Par> : null}
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { variables } = useSolution()
			const { x } = variables
			return <>
				<Par><Translation>Find the values for <M>a</M>, <M>b</M> and <M>c</M> so that the given equation matches the general form for quadratic equations <M>a{x}^2 + b{x}+c = 0</M>.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="a" prelabel={<M>a=</M>} size="l" settings={ExpressionInput.settings.numericWithRoots} validate={ExpressionInput.validation.numeric} />
						<ExpressionInput id="b" prelabel={<M>b=</M>} size="l" settings={ExpressionInput.settings.numericWithRoots} validate={ExpressionInput.validation.numeric} />
						<ExpressionInput id="c" prelabel={<M>c=</M>} size="l" settings={ExpressionInput.settings.numericWithRoots} validate={ExpressionInput.validation.numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ a, b, c }) => {
			return <Par><Translation>By comparing the equations, we can see that <M>a = {a}</M>, <M>b = {b}</M> and <M>c = {c}</M>.</Translation></Par>
		},
	},
	{
		Problem: ({ x }) => {
			return <>
				<Par><Translation>Substitute <M>a</M>, <M>b</M> and <M>c</M> into the quadratic formula. (You can use the plus/minus symbol from the app's internal keyboard, or type &quot;pm&quot;.)</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="solutionFull" prelabel={<M>{x}=</M>} size="l" settings={{ ...ExpressionInput.settings.numericWithRoots, plusMinus: true }} validate={ExpressionInput.validation.numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ a, b, c, solutionFull }) => {
			return <Par><Translation>The quadratic formula states that <BM>x = \frac(-b \pm \sqrt(b^2 - 4ac))(2a).</BM> Entering the values <M>a = {a}</M>, <M>b = {b}</M> and <M>c = {c}</M> turns this into <BM>{solutionFull}</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			return <>
				<Par><Translation>Calculate the value of the discriminant (the number within the square root).</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="D" prelabel={<M>b^2 - 4ac=</M>} size="l" settings={ExpressionInput.settings.numericWithRoots} validate={ExpressionInput.validation.numeric} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ DFull, D }) => {
			return <Translation>
				<Par>We can directly calculate that <M>{DFull}</M> equals <M>{D}</M>.</Par>
			</Translation>
		},
	},
	{
		Problem: ({ x }) => {
			return <>
				<Par><Translation>Based on the value of the discriminant, determine how many solutions the given equation has.</Translation></Par>
				<InputSpace>
					<NumSolutionsInput x={x} />
				</InputSpace>
			</>
		},
		Solution: () => {
			return <Translation>
				<Par>Because the value within the square root (the discriminant) is negative, the square root is impossible to evaluate. There are hence no possible solutions to the quadratic equation.</Par>
			</Translation>
		},
	},
]

function getFeedback(exerciseData) {
	const { translateCrossExercise } = exerciseData
	return {
		...getMCFeedback(exerciseData, {
			numSolutions: [
				translateCrossExercise(<>Exactly. The discriminant <M>D = b^2 - 4ac</M> is negative, so the square root has no valid outcomes.</>, "0Correct"),
				translateCrossExercise(<>That can't be true. This is only the case when the discriminant <M>D = b^2 - 4ac</M> is equal to zero.</>, "1Incorrect"),
				translateCrossExercise(<>This doesn't add up. This would be the case when the discriminant <M>D = b^2 - 4ac</M> is larger than zero.</>, "2Incorrect"),
				translateCrossExercise(<>No, this cannot be the case. A quadratic equation never has more than two solutions.</>, "3Incorrect"),
			],
		}),
		...getFieldInputFeedback(exerciseData, ['a', 'b', 'c', 'D']),
		...getFieldInputFeedback(exerciseData, {
			solutionFull: [],
		}),
		ans1: selectRandomIncorrect(true),
		ans2: selectRandomIncorrect(true),
		ans3: selectRandomIncorrect(true),
	}
}

function NumSolutionsInput() {
	const { x } = useSolution()
	return <CrossExerciseTranslation entry="numSolutionsInput">
		<MultipleChoice id="numSolutions" choices={[
			<>There are no possible solutions for <M>{x}</M>.</>,
			<>There is <M>1</M> solution for <M>{x}</M>.</>,
			<>There are <M>2</M> solutions for <M>{x}</M>.</>,
			<>There are <M>3</M> solutions for <M>{x}</M>.</>,
		]} />
	</CrossExerciseTranslation>
}
