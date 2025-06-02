import React from 'react'

import { Sum, Product, expressionComparisons } from 'step-wise/CAS'

import { Translation } from 'i18n'
import { Par, M, BM } from 'ui/components'
import { InputSpace } from 'ui/form'
import { ExpressionInput, EquationInput } from 'ui/inputs'
import { useSolution, StepExercise, getFieldInputFeedback, expressionChecks, equationChecks } from 'ui/eduTools'

const { onlyOrderChanges, equivalent } = expressionComparisons
const { hasX, incorrectFraction, incorrectExpression } = expressionChecks
const { originalEquation, correctEquation, incorrectEquation, sumWithWrongTerms } = equationChecks

export default function Exercise() {
	return <StepExercise Problem={Problem} steps={steps} getFeedback={getFeedback} />
}

const Problem = () => {
	const { variables, equation } = useSolution()
	return <>
		<Par><Translation>Consider the equation <BM>{equation}.</BM> Solve it for <M>{variables.x}</M>.</Translation></Par>
		<InputSpace>
			<Par>
				<ExpressionInput id="ans" prelabel={<M>{variables.x}=</M>} size="l" settings={ExpressionInput.settings.basicMath} validate={ExpressionInput.validation.validWithVariables(variables)} />
			</Par>
		</InputSpace>
	</>
}

const steps = [
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par><Translation>Move all terms with <M>{variables.x}</M> to one side of the equation, and all terms without <M>{variables.x}</M> to the other side.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="termsMoved" size="l" settings={EquationInput.settings.basicMath} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ equation, termsMoved }) => {
			return <Par><Translation>We move <M>{equation.right.terms[0].abs()}</M> to the left and <M>{equation.left.terms[1].abs()}</M> to the right. This gives us <BM>{termsMoved}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par><Translation>Pull <M>{variables.x}</M> outside of brackets. Leave the rest of the equation unchanged.</Translation></Par>
				<InputSpace>
					<Par>
						<EquationInput id="pulledOut" size="l" settings={EquationInput.settings.basicMath} validate={EquationInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, termsMoved, bracketTerm, pulledOut }) => {
			return <Par><Translation>To pull <M>{variables.x}</M> outside of brackets, we must write <M>{termsMoved.left}</M> as <M>{variables.x}\cdot\left(\ldots\right)</M>. This tells us that there should be <M>{bracketTerm}</M> between the brackets. In this way we can rewrite the equation as <BM>{pulledOut}.</BM></Translation></Par>
		},
	},
	{
		Problem: () => {
			const { variables } = useSolution()
			return <>
				<Par><Translation>Divide both sides of the equation by the term between brackets, to solve for <M>{variables.x}</M>.</Translation></Par>
				<InputSpace>
					<Par>
						<ExpressionInput id="ans" prelabel={<M>{variables.x}=</M>} size="l" settings={ExpressionInput.settings.basicMath} validate={ExpressionInput.validation.validWithVariables(variables)} />
					</Par>
				</InputSpace>
			</>
		},
		Solution: ({ variables, bracketTerm, ans }) => {
			return <Par><Translation>If we divide both sides by <M>{bracketTerm}</M>, then on the left the term between brackets disappears. We only remain with <M>{variables.x}</M>, meaning that we have indeed solved the equation for <M>{variables.x}</M>! The final result is <BM>{variables.x} = {ans}.</BM> Of course this solution can also be written in other ways, but small variations in notation are not relevant here.</Translation></Par>
		},
	},
]

function getFeedback(exerciseData) {
	const { translate } = exerciseData

	// Define termsMoved checks.
	const variableOnBothSides = (input, correct, { variables }) => input.left.dependsOn(variables.x) && input.right.dependsOn(variables.x) && translate(<>Both sides of the equation still contain <M>{variables.x}</M>. Pull all terms with <M>{variables.x}</M> to the <em>same</em> side.</>, 'variableOnBothSides')
	const termsWithoutVariableInWrongPlace = (input, correct, { variables }) => {
		const sideWithVariable = input.findSide(side => side.dependsOn(variables.x))
		if (!sideWithVariable)
			return translate(<>Your solution does not contain <M>{variables.x}</M>. Where did it go?</>, 'missingVariable')
		if (!sideWithVariable.isSubtype(Sum))
			return translate(<>There were multiple terms with <M>{variables.x}</M>, but you only wrote down one.</>, 'oneVariable')
		const termWithoutVariable = sideWithVariable.terms.find(term => !term.dependsOn(variables.x))
		if (termWithoutVariable)
			return translate(<>You did bring all terms with <M>{variables.x}</M> to one side, but there's also a term <M>{termWithoutVariable}</M> that does not contain <M>{variables.x}</M>.</>, 'termWithoutVariable')
	}
	const sumWithWrongTermsAndFlip = (input, correct, solution, isCorrect) => {
		return input.left.dependsOn(solution.variables.x) ? sumWithWrongTerms(input, correct, solution, isCorrect) : sumWithWrongTerms(input, correct.switch().applyMinus(), solution, isCorrect)
	}

	// Define pulledOut checks.
	const sideWithoutVariableEqual = (input, correct, { variables }) => {
		const sideWithoutVariable = input.findSide(side => !side.dependsOn(variables.x))
		const sideWithVariable = input.findSide(side => side.dependsOn(variables.x))
		if (!sideWithoutVariable)
			return translate(<>You put the variable <M>{variables.x}</M> on both sides of the equation again. That was not supposed to happen.</>, 'noSideWithoutVariable')
		if (sideWithVariable && !onlyOrderChanges(sideWithoutVariable, correct.right) && !onlyOrderChanges(sideWithoutVariable, correct.right.applyMinus()))
			return translate(<>The side without <M>{variables.x}</M> should remain the same!</>, 'unequalSideWithoutVariable')
	}
	const sideWithVariableEqual = (input, correct, { variables }) => {
		const sideWithVariable = input.findSide(side => side.dependsOn(variables.x))
		if (!sideWithVariable)
			return translate(<>You somehow let <M>{variables.x}</M> disappear entirely. That was not supposed to happen.</>, 'disappearedVariable')
		if (!equivalent(sideWithVariable, correct.left) && !equivalent(sideWithVariable, correct.left.applyMinus()))
			return translate(<>The side with <M>{variables.x}</M> is not equal to what it was before. Something went wrong during the rewriting.</>, 'unequalSide')
		if (!(sideWithVariable.isSubtype(Product) && sideWithVariable.terms.length === 2 && sideWithVariable.terms.some(term => variables.x.equals(term))))
			return translate(<>You did not pull <M>{variables.x}</M> outside of brackets. You should write the side containing <M>{variables.x}</M> as <M>{variables.x}\cdot\left(\ldots\right)</M>, with on the dots an expression that's as simple as possible.</>, 'notOutsideOfBrackets')
	}

	// Determine feedback.
	return getFieldInputFeedback(exerciseData, {
		ans: [hasX, incorrectFraction, incorrectExpression],
		termsMoved: [originalEquation, variableOnBothSides, termsWithoutVariableInWrongPlace, sumWithWrongTermsAndFlip, incorrectEquation, correctEquation],
		pulledOut: [sideWithoutVariableEqual, sideWithVariableEqual, incorrectEquation, correctEquation],
	})
}
