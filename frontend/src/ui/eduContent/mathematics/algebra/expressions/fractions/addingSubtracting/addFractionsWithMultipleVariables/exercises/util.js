import { expressionComparisons } from 'step-wise/CAS'

import { M } from 'ui/components'
import { CrossExerciseTranslation } from 'ui/eduTools'

const { onlyOrderChanges, equivalent, integerMultiple, constantMultiple } = expressionComparisons

export function SCM() {
	return <>
		<CrossExerciseTranslation entry="smallestCommonMultiple">Smallest common multiple</CrossExerciseTranslation>:
	</>
}

// Define denominator checks.
export const denominatorEquivalent = (input, correct, solution, isCorrect, { translateCrossExercise }) => !isCorrect && equivalent(input, correct) && translateCrossExercise(<>Technically correct, but you can still simplify this.</>, 'denominatorEquivalent')

export const denominatorNotSmallestMultiple = (input, correct, solution, isCorrect, { translateCrossExercise }) => !isCorrect && integerMultiple(input, correct) && translateCrossExercise(<>This is indeed a multiple of both denominators, but it is not the <strong>smallest</strong> common multiple.</>, 'denominatorNotSmallestMultiple')

export const denominatorWrongFactor = (input, correct, solution, isCorrect, { translateCrossExercise }) => !isCorrect && constantMultiple(input, correct) && translateCrossExercise(<>You've got the variables correct, but something is wrong with the number that you entered.</>, 'denominatorWrongFactor')

export const denominatorMissingDependency = (input, correct, { variables }, isCorrect, { translateCrossExercise }) => {
	const missingDependency = ['x', 'y'].find(variable => !input.dependsOn(variables[variable]))
	return missingDependency && translateCrossExercise(<>I can't find any <M>{variables[missingDependency]}</M> in your answer. This variable was expected somewhere.</>, 'denominatorMissingDependency')
}

// Define fraction checks.
export const wrongDenominator = (input, correct, solution, isCorrect, { translateCrossExercise }) => !onlyOrderChanges(correct.denominator, input.elementaryClean().denominator) && translateCrossExercise(<>Your fraction doesn't have the desired denominator <M>{correct.denominator}</M>.</>, 'wrongDenominator')

export const wrongNumerator = (input, correct, solution, isCorrect, { translateCrossExercise }) => !equivalent(correct.numerator, input.elementaryClean().numerator) && translateCrossExercise(<>The denominator is correct, but something is off in the numerator of your fraction.</>, 'wrongNumerator')

export const nonSimplifiedNumerator = (input, correct, solution, isCorrect, { translateCrossExercise }) => !onlyOrderChanges(correct.numerator, input.elementaryClean().numerator) && translateCrossExercise(<>You can still simplify the numerator of your fraction.</>, 'nonSimplifiedNumerator')

export const correctFraction = (input, correct, solution, isCorrect, { translateCrossExercise }) => !isCorrect && equivalent(input, correct) && translateCrossExercise(<>The fraction is correct, but you can still simplify it further.</>, 'correctFraction')

// Define ans checks.
export const ansEquivalent = (input, correct, solution, isCorrect, { translateCrossExercise }) => !isCorrect && equivalent(input, correct) && translateCrossExercise(<>This is correct, but it can be written simpler.</>, 'ansEquivalent')

export const denominatorCorrect = (input, correct, solution, isCorrect, { translateCrossExercise }) => !isCorrect && onlyOrderChanges(correct.denominator, input.elementaryClean().denominator) && translateCrossExercise(<>The denominator is correct, but something is off in the numerator of your fraction.</>, 'denominatorCorrect')

export const nonSimplifiedTerms = (input, correct, solution, isCorrect, { translateCrossExercise }) => {
	const unsimplifiedTerm = input.terms.findIndex(inputTerm => !correct.terms.some(correctTerm => onlyOrderChanges(inputTerm, correctTerm)))
	if (unsimplifiedTerm !== -1)
		return [
			translateCrossExercise(<>The first term of your answer can be simplified further.</>, 'nonSimplifiedFirstTerm'),
			translateCrossExercise(<>The second term of your answer can be simplified further.</>, 'nonSimplifiedSecondTerm'),
		][unsimplifiedTerm]
}
