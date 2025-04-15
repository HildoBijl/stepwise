import { Sum, Product, expressionComparisons } from 'step-wise/CAS'

import { M } from 'ui/components'
import { equationChecks } from 'ui/eduTools'

const { onlyOrderChanges, equivalent } = expressionComparisons
const { sumWithWrongTerms } = equationChecks

// Define termsMoved checks.
export const variableOnBothSides = (input, correct, { variables }, isCorrect, { translateCrossExercise }) => input.left.dependsOn(variables.x) && input.right.dependsOn(variables.x) && translateCrossExercise(<>Both sides of the equation still contain <M>{variables.x}</M>. Pull all terms with <M>{variables.x}</M> to the <em>same</em> side.</>, 'variableOnBothSides')

export const termsWithoutVariableInWrongPlace = (input, correct, { variables }, isCorrect, { translateCrossExercise }) => {
	const sideWithVariable = input.findSide(side => side.dependsOn(variables.x))?.side
	if (!sideWithVariable)
		return translateCrossExercise(<>Your solution does not contain <M>{variables.x}</M>. Where did it go?</>, 'missingVariable')
	if (!sideWithVariable.isSubtype(Sum))
		return translateCrossExercise(<>There were multiple terms with <M>{variables.x}</M>, but you only wrote down one.</>, 'oneVariable')
	const termWithoutVariable = sideWithVariable.terms.find(term => !term.dependsOn(variables.x))
	if (termWithoutVariable)
		return translateCrossExercise(<>You did bring all terms with <M>{variables.x}</M> to one side, but there's also a term <M>{termWithoutVariable}</M> that does not contain <M>{variables.x}</M>.</>, 'termWithoutVariable')
}

export const sumWithWrongTermsAndFlip = (input, correct, solution, isCorrect) => {
	return input.left.dependsOn(solution.variables.x) ? sumWithWrongTerms(input, correct, solution, isCorrect) : sumWithWrongTerms(input, correct.switch().applyMinus(), solution, isCorrect)
}

// Define pulledOut checks.
export const sideWithoutVariableEqual = (input, correct, { variables }, isCorrect, { translateCrossExercise }) => {
	const sideWithoutVariable = input.findSide(side => !side.dependsOn(variables.x))?.side
	const sideWithVariable = input.findSide(side => side.dependsOn(variables.x))?.side
	if (!sideWithoutVariable)
		return translateCrossExercise(<>You put the variable <M>{variables.x}</M> on both sides of the equation again. That was not supposed to happen.</>, 'noSideWithoutVariable')
	if (sideWithVariable && !onlyOrderChanges(sideWithoutVariable, correct.right) && !onlyOrderChanges(sideWithoutVariable, correct.right.applyMinus()))
		return translateCrossExercise(<>The side without <M>{variables.x}</M> should remain the same!</>, 'unequalSideWithoutVariable')
}

export const sideWithVariableEqual = (input, correct, { variables }, isCorrect, { translateCrossExercise }) => {
	const sideWithVariable = input.findSide(side => side.dependsOn(variables.x))?.side
	if (!sideWithVariable)
		return translateCrossExercise(<>You somehow let <M>{variables.x}</M> disappear entirely. That was not supposed to happen.</>, 'disappearedVariable')
	if (!equivalent(sideWithVariable, correct.left) && !equivalent(sideWithVariable, correct.left.applyMinus()))
		return translateCrossExercise(<>The side with <M>{variables.x}</M> is not equal to what it was before. Something went wrong during the rewriting.</>, 'unequalSide')
	if (!(sideWithVariable.isSubtype(Product) && sideWithVariable.terms.length === 2 && sideWithVariable.terms.some(term => variables.x.equals(term))))
		return translateCrossExercise(<>You did not pull <M>{variables.x}</M> outside of brackets. You should write the side containing <M>{variables.x}</M> as <M>{variables.x}\cdot\left(\ldots\right)</M>, with on the dots an expression that's as simple as possible.</>, 'notOutsideOfBrackets')
}
