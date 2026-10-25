import { expressionComparisons } from '@step-wise/cas'
import { M } from '@step-wise/math-display'

import { equationChecks, FeedbackTranslation } from 'ui/eduTools'

const { areEqualExceptOrder, areEquivalent: equivalent } = expressionComparisons
const { sumWithWrongTerms } = equationChecks

// Define termsMoved checks.
export const variableOnBothSides = (input, correct, { variables }, isCorrect) => input.left.dependsOn(variables.x) && input.right.dependsOn(variables.x) && <FeedbackTranslation shared id="variableOnBothSides">Both sides of the equation still contain <M>{variables.x}</M>. Pull all terms with <M>{variables.x}</M> to the <em>same</em> side.</FeedbackTranslation>

export const termsWithoutVariableInWrongPlace = (input, correct, { variables }, isCorrect) => {
	const sideWithVariable = input.findSide(side => side.dependsOn(variables.x))?.side
	if (!sideWithVariable)
		return <FeedbackTranslation shared id="missingVariable">Your solution does not contain <M>{variables.x}</M>. Where did it go?</FeedbackTranslation>
	if (!sideWithVariable.isSum())
		return <FeedbackTranslation shared id="oneVariable">There were multiple terms with <M>{variables.x}</M>, but you only wrote down one.</FeedbackTranslation>
	const termWithoutVariable = sideWithVariable.terms.find(term => !term.dependsOn(variables.x))
	if (termWithoutVariable)
		return <FeedbackTranslation shared id="termWithoutVariable">You did bring all terms with <M>{variables.x}</M> to one side, but there's also a term <M>{termWithoutVariable}</M> that does not contain <M>{variables.x}</M>.</FeedbackTranslation>
}

export const sumWithWrongTermsAndFlip = (input, correct, solution, isCorrect) => {
	return input.left.dependsOn(solution.variables.x) ? sumWithWrongTerms(input, correct, solution, isCorrect) : sumWithWrongTerms(input, correct.switchSides().negate(), solution, isCorrect)
}

// Define pulledOut checks.
export const sideWithoutVariableEqual = (input, correct, { variables }, isCorrect) => {
	const sideWithoutVariable = input.findSide(side => !side.dependsOn(variables.x))?.side
	const sideWithVariable = input.findSide(side => side.dependsOn(variables.x))?.side
	if (!sideWithoutVariable)
		return <FeedbackTranslation shared id="noSideWithoutVariable">You put the variable <M>{variables.x}</M> on both sides of the equation again. That was not supposed to happen.</FeedbackTranslation>
	if (sideWithVariable && !areEqualExceptOrder(sideWithoutVariable, correct.right) && !areEqualExceptOrder(sideWithoutVariable, correct.right.negate()))
		return <FeedbackTranslation shared id="unequalSideWithoutVariable">The side without <M>{variables.x}</M> should remain the same!</FeedbackTranslation>
}

export const sideWithVariableEqual = (input, correct, { variables }, isCorrect) => {
	const sideWithVariable = input.findSide(side => side.dependsOn(variables.x))?.side
	if (!sideWithVariable)
		return <FeedbackTranslation shared id="disappearedVariable">You somehow let <M>{variables.x}</M> disappear entirely. That was not supposed to happen.</FeedbackTranslation>
	if (!equivalent(sideWithVariable, correct.left) && !equivalent(sideWithVariable, correct.left.negate()))
		return <FeedbackTranslation shared id="unequalSide">The side with <M>{variables.x}</M> is not equal to what it was before. Something went wrong during the rewriting.</FeedbackTranslation>
	if (!(sideWithVariable.isProduct() && sideWithVariable.factors.length === 2 && sideWithVariable.factors.some(term => term.equalStructure(variables.x))))
		return <FeedbackTranslation shared id="notOutsideOfBrackets">You did not pull <M>{variables.x}</M> outside of brackets. You should write the side containing <M>{variables.x}</M> as <M>{variables.x}\cdot\left(\ldots\right)</M>, with on the dots an expression that's as simple as possible.</FeedbackTranslation>
}
