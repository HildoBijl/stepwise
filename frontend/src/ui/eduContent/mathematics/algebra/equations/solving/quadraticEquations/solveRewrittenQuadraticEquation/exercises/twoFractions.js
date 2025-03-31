import React from 'react'

import { numberArray } from 'step-wise/util'
import { expressionComparisons } from 'step-wise/CAS'

import { Translation, Check, Plurals } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace, useInput, selectRandomIncorrect } from 'ui/form'
import { ExpressionInput, EquationInput, MultipleChoice } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, getFieldInputListFeedback, getMCFeedback, equationChecks, CrossExerciseTranslation } from 'ui/eduTools'

const { onlyOrderChanges } = expressionComparisons
const { originalEquation, sumWithUnsimplifiedTerms } = equationChecks

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
			return <>
				<Par><Translation>Bring the equation to its standard form.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="standardForm" size="l" settings={EquationInput.settings.rational} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, multiplied, expanded, merged, moved, divisor, standardForm }) => {
			return <Par><Translation>First we want to get <M>{variables.x}</M> out of any denominator. To do so, we multiply all terms by the denominators of the two fractions. This gives us <BM>{multiplied}.</BM> Expanding all brackets turns this into <BM>{expanded}.</BM> Merging terms reduces this to <BM>{merged}.</BM> If we then move everything to the left, we find <BM>{moved}.</BM> <Check value={divisor === 1}><Check.True>This equation is already in its simplest form.</Check.True><Check.False>This equation can still be written simpler (optional) if we divide all terms by <M>{divisor}</M>. This results in <BM>{standardForm}.</BM></Check.False></Check></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { x } = useSolution()
			const numSolutions = useInput('numSolutions')
			return <>
				<Par><Translation>For the equation in standard form, find all possible solutions for <M>{x}</M> and simplify them as much as possible. (This includes pulling factors out of roots and canceling factors within fractions.)</Translation></Par>
				<InputSpace>
					<NumSolutionsInput />
					{numSolutions ? <Par>
						{numberArray(1, numSolutions).map(index => <ExpressionInput key={index} id={`ans${index}`} prelabel={<M>{x}_{index}=</M>} size="l" settings={ExpressionInput.settings.numericWithRoots} validate={ExpressionInput.validation.numeric} persistent={true} />
						)}
					</Par> : null}
				</InputSpace>
			</>
		},
		Solution: ({ x, p, q, r, solutionFull, D, numSolutions, solutionHalfSimplified, solution, solutionsSplit, solutions, equationsSubstituted }) => {
			return <Translation>
				<Par>The plan is to apply the quadratic formula. By comparing our simplified equation with the default quadratic equation <M>ax^2 + bx + c = 0</M>, we can see that <M>a = {p}</M>, <M>b = {q}</M> and <M>c = {r}</M>. Substituting this into the quadratic formula gives us <BM>{solutionFull}.</BM> The discriminant here (the value within the square root) is equal to <M>{D}</M>.
					<Plurals value={numSolutions}>
						<Plurals.Zero> Since this is a negative number, it means that there are no possible solutions to the equation. No further work is required.</Plurals.Zero>
						<Plurals.One> Because the discriminant is zero, the square root vanishes and there is only one possible solution. This solution is equal to {onlyOrderChanges(solutionHalfSimplified, solution) ? <BM>{x} = {solutionHalfSimplified}.</BM> : <BM>{x} = {solutionHalfSimplified} = {solution}.</BM>}</Plurals.One>
						<Plurals.Two> Since this is a positive number, it means that there are two solutions to the equation. These solutions can be simplified into {onlyOrderChanges(solutionHalfSimplified, solution) ? <BM>{x} = {solutionHalfSimplified}.</BM> : <BM>{x} = {solutionHalfSimplified} = {solution}.</BM>} Entering a plus or a minus results in the two actual solutions {onlyOrderChanges(solutionsSplit[0], solutions[0]) ? <BM>{x}_1 = {solutionsSplit[0]},</BM> : <BM>{x}_1 = {solutionsSplit[0]} = {solutions[0]},</BM>} {onlyOrderChanges(solutionsSplit[1], solutions[1]) ? <BM>{x}_2 = {solutionsSplit[1]}.</BM> : <BM>{x}_2 = {solutionsSplit[1]} = {solutions[1]}.</BM>}</Plurals.Two>
					</Plurals>
				</Par>
				<Par>
					<Plurals value={numSolutions}>
						<Plurals.One>As final check, we insert the solution <M>{x}</M> into the original equation. This results in <BM>{equationsSubstituted[0]}.</BM> Simplifying all fractions shows that this equation holds, which means that the solution we found is correct.</Plurals.One>
						<Plurals.Two>As final check, we insert the two solutions <M>{x}_1</M> and <M>{x}_2</M> into the original equation. This results in <BM>{equationsSubstituted[0]},</BM><BM>{equationsSubstituted[1]}.</BM> With quite some work (or through the use of a calculator) we can verify that both of these equations hold, so the solutions we found are correct.</Plurals.Two>
					</Plurals>
				</Par>
			</Translation>
		},
	},
]

function getFeedback(exerciseData) {
	const { solution, translateCrossExercise } = exerciseData
	const { numSolutions } = solution
	return {
		...getMCFeedback(exerciseData, {
			numSolutions: {
				correctText: translateCrossExercise(<>That is correct!</>, "numSolutionsCorrect"),
				incorrectText: translateCrossExercise(<>That is not correct. You might want to check the discriminant of your equation.</>, "numSolutionsIncorrect"),
			},
		}),
		...getFieldInputFeedback(exerciseData, {
			standardForm: [originalEquation, sumWithUnsimplifiedTerms],
		}),
		...{
			ans1: selectRandomIncorrect(true),
			ans2: selectRandomIncorrect(true),
			ans3: selectRandomIncorrect(true),
			...(numSolutions === 1 ? getFieldInputFeedback(exerciseData, 'ans1') : {}),
			...(numSolutions === 2 ? getFieldInputListFeedback(exerciseData, ['ans1', 'ans2']) : {}),
		},
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
