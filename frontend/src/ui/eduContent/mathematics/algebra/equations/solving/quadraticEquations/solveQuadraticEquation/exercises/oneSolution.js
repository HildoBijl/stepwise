import React from 'react'

import { numberArray } from 'step-wise/util'

import { Translation } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace, useInput, selectRandomIncorrect } from 'ui/form'
import { MultipleChoice, ExpressionInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, getMCFeedback, expressionChecks, CrossExerciseTranslation } from 'ui/eduTools'

const { wrongSign, unsimplifiedFractionNumbers, unsimplifiedFractionFactors, equivalentExpression } = expressionChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { x, equation } = useSolution()
	const numSolutions = useInput('numSolutions')
	return <>
		<Par><Translation>Consider the equation <BM>{equation}.</BM> Solve this equation for <M>{x}</M> and simplify the result as much as possible.</Translation></Par>
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
				<Par>When the square root reduces to zero, the plus/minus in the solution vanishes and the equation will have exactly one solution.</Par>
			</Translation>
		},
	},
	{
		Problem: ({ x }) => {
			const { numSolutions } = useSolution()
			return <>
				<Par><Translation>Write down the final solution of the given equation, simplified as much as possible.</Translation></Par>
				<InputSpace>
					<Par>
						{numberArray(1, numSolutions).map(index => <ExpressionInput key={index} id={`ans${index}`} prelabel={<M>{numSolutions === 1 ? x : `{x}_{index}`}=</M>} size="l" settings={ExpressionInput.settings.numericWithRoots} validate={ExpressionInput.validation.numeric} persistent={true} />
						)}
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ solutionHalfSimplified, ans1 }) => {
			return <Translation>
				<Par>By calculating <M>{solutionHalfSimplified}</M> we can reduce it to a single number <M>{ans1}</M>.</Par>
			</Translation>
		},
	},
]

function getFeedback(exerciseData) {
	const { translateCrossExercise } = exerciseData
	return {
		...getMCFeedback(exerciseData, {
			numSolutions: [
				translateCrossExercise(<>This is not correct. This would be the case when the discriminant <M>D = b^2 - 4ac</M> is smaller than zero.</>, "0Incorrect"),
				translateCrossExercise(<>Spot on! The discriminant <M>D = b^2 - 4ac</M> is equal to zero.</>, "1Correct"),
				translateCrossExercise(<>This doesn't add up. This would be the case when the discriminant <M>D = b^2 - 4ac</M> is larger than zero.</>, "2Incorrect"),
				translateCrossExercise(<>No, this cannot be the case. A quadratic equation never has more than two solutions.</>, "3Incorrect"),
			],
		}),
		...getFieldInputFeedback(exerciseData, ['a', 'b', 'c', 'D']),
		...getFieldInputFeedback(exerciseData, {
			solutionFull: [],
			ans1: [wrongSign, unsimplifiedFractionNumbers, unsimplifiedFractionFactors, equivalentExpression],
		}),
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
