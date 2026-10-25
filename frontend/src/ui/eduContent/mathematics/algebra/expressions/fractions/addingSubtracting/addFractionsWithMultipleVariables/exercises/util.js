import { expressionComparisons } from '@step-wise/cas'
import { M } from '@step-wise/math-display'

import { FeedbackTranslation } from 'ui/eduTools'

const { areEqualExceptOrder, areEquivalent: equivalent, areIntegerMultiples, areConstantMultiples } = expressionComparisons

export function LCM() {
	return <>
		<FeedbackTranslation shared id="leastCommonMultiple">Least common multiple</FeedbackTranslation>:
	</>
}

// Define denominator checks.
export const denominatorEquivalent = (input, correct, solution, isCorrect) => !isCorrect && equivalent(input, correct) && <FeedbackTranslation shared id="denominatorEquivalent">Technically correct, but you can still simplify this.</FeedbackTranslation>

export const denominatorNotSmallestMultiple = (input, correct, solution, isCorrect) => !isCorrect && areIntegerMultiples(input, correct) && <FeedbackTranslation shared id="denominatorNotSmallestMultiple">This is indeed a multiple of both denominators, but it is not the <strong>smallest</strong> common multiple.</FeedbackTranslation>

export const denominatorWrongFactor = (input, correct, solution, isCorrect) => !isCorrect && areConstantMultiples(input, correct) && <FeedbackTranslation shared id="denominatorWrongFactor">You've got the variables correct, but something is wrong with the number that you entered.</FeedbackTranslation>

export const denominatorMissingDependency = (input, correct, { variables }, isCorrect) => {
	const missingDependency = ['x', 'y'].find(variable => !input.dependsOn(variables[variable]))
	return missingDependency && <FeedbackTranslation shared id="denominatorMissingDependency">I can't find any <M>{variables[missingDependency]}</M> in your answer. This variable was expected somewhere.</FeedbackTranslation>
}

// Define fraction checks.
export const wrongDenominator = (input, correct, solution, isCorrect) => !areEqualExceptOrder(correct.denominator, input.flatten().denominator) && <FeedbackTranslation shared id="wrongDenominator">Your fraction doesn't have the desired denominator <M>{correct.denominator}</M>.</FeedbackTranslation>

export const wrongNumerator = (input, correct, solution, isCorrect) => !equivalent(correct.numerator, input.flatten().numerator) && <FeedbackTranslation shared id="wrongNumerator">The denominator is correct, but something is off in the numerator of your fraction.</FeedbackTranslation>

export const nonSimplifiedNumerator = (input, correct, solution, isCorrect) => !areEqualExceptOrder(correct.numerator, input.flatten().numerator) && <FeedbackTranslation shared id="nonSimplifiedNumerator">You can still simplify the numerator of your fraction.</FeedbackTranslation>

export const correctFraction = (input, correct, solution, isCorrect) => !isCorrect && equivalent(input, correct) && <FeedbackTranslation shared id="correctFraction">The fraction is correct, but you can still simplify it further.</FeedbackTranslation>

// Define ans checks.
export const ansEquivalent = (input, correct, solution, isCorrect) => !isCorrect && equivalent(input, correct) && <FeedbackTranslation shared id="ansEquivalent">This is correct, but it can be written simpler.</FeedbackTranslation>

export const denominatorCorrect = (input, correct, solution, isCorrect) => !isCorrect && areEqualExceptOrder(correct.denominator, input.flatten().denominator) && <FeedbackTranslation shared id="denominatorCorrect">The denominator is correct, but something is off in the numerator of your fraction.</FeedbackTranslation>

export const nonSimplifiedTerms = (input, correct, solution, isCorrect) => {
	const unsimplifiedTerm = input.terms.findIndex(inputTerm => !correct.terms.some(correctTerm => areEqualExceptOrder(inputTerm, correctTerm)))
	if (unsimplifiedTerm !== -1)
		return [
			<FeedbackTranslation shared id="nonSimplifiedFirstTerm">The first term of your answer can be simplified further.</FeedbackTranslation>,
			<FeedbackTranslation shared id="nonSimplifiedSecondTerm">The second term of your answer can be simplified further.</FeedbackTranslation>,
		][unsimplifiedTerm]
}
