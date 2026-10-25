// This file contains various feedback checks that are used more commonly among exercises. They can be loaded in and used directly then.

import { expressionChecks, expressionComparisons } from '@step-wise/cas'
import { M } from '@step-wise/math-display'
import { Translation } from '@step-wise/i18n'

import { CountingWord } from 'i18n'

const { areEqualExceptOrder, areEquivalent: equivalent, areConstantMultiples } = expressionComparisons


/*
 * Basic checks.
 */

export const originalExpression = (input, correct, { expression }, isCorrect) => {
	if (!expression)
		throw new Error(`Invalid originalExpression call: to use the originalExpression feedback check, there must be an "expression" parameter (the starting point) in the solution object to compare to. This is not present.`)
	return !isCorrect && areEqualExceptOrder(input.flatten(), expression.flatten()) && <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="original">This is the original expression. You have not rewritten it yet.</Translation>
}

// nonEquivalentExpression checks for equivalency and is useful for exercises where an expression needs to be rewritten. The text assumes an expression was given.
export const nonEquivalentExpression = (input, correct, solution, isCorrect) => !isCorrect && !equivalent(input, correct) && <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="incorrect">This expression is not equal to what has been given. In rewriting it you took a wrong step somewhere.</Translation>

// nonEquivalentSolution does the same as nonEquivalentSolution but the message focuses on a solution. It assumes the given expression is the solution of solving some type of equation or similar.
export const nonEquivalentSolution = (input, correct, solution, isCorrect) => !isCorrect && !equivalent(input, correct) && <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="nonEquivalentSolution">This is not the right solution, nor is it equivalent to it. Check your steps leading up to this.</Translation>

export const equivalentExpression = (input, correct, solution, isCorrect) => !isCorrect && equivalent(input, correct) && <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="correct">The expression is correct, but you have not done what was required.</Translation>

/*
 * Sum and terms checks.
 */

export const noSum = (input, correct, solution, isCorrect) => !isCorrect && !input.isSum() && <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="noSum">You have to write your solution as an addition/subtraction of terms. Your solution sadly is not an addition/subtraction.</Translation>

export const sumWithWrongTerms = (input, correct, solution, isCorrect) => {
	if (isCorrect)
		return

	// When the correct version is not a sum, something is wrong.
	if (!correct.isSum())
		return // Cannot check for a non-sum.

	// Ensure it's a sum.
	const noSumResult = noSum(input)
	if (noSumResult)
		return noSumResult

	// Check if the number of terms matches.
	if (correct.terms.length !== input.terms.length)
		return <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="wrongNumberOfSumTerms">There was supposed to be an addition/subtraction with {{ expectedNumTerms: correct.terms.length }} terms, each with a plus or minus sign in-between. Your response has {{ inputNumTerms: input.terms.length }} terms.</Translation>

	// Find an input term that is not in the solution.
	const index = input.terms.findIndex(inputTerm => !correct.terms.some(correctTerm => equivalent(inputTerm, correctTerm)))
	if (index !== -1)
		return <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="errorInSumTerm">There seems to be an error in the <CountingWord ordinal={true}>{index + 1}</CountingWord> term of your solution.</Translation>
}

export const sumWithUnsimplifiedTerms = (input, correct, solution, isCorrect) => {
	if (isCorrect)
		return

	// Run equivalence checks.
	const sumWithWrongTermsResult = sumWithWrongTerms(input, correct)
	if (sumWithWrongTermsResult)
		return sumWithWrongTermsResult

	// Find an input term that is not in the solution when checking only for order changes.
	const index = input.terms.findIndex(inputTerm => !correct.terms.some(correctTerm => areEqualExceptOrder(inputTerm, correctTerm)))
	if (index !== -1)
		return <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="unsimplifiedSumTerm">You can still further simplify the <CountingWord ordinal={true}>{index + 1}</CountingWord> term of your solution.</Translation>
}

/*
 * Product and factor checks.
 */

export const noProduct = (input, correct, solution, isCorrect) => !isCorrect && !input.isProduct() && <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="noProduct">You have to write your solution as a multiplication of factors. Your solution sadly is not a product.</Translation>

export const productWithWrongFactors = (input, correct, solution, isCorrect) => {
	if (isCorrect)
		return

	// When the correct version is not a product, something is wrong.
	if (!correct.isProduct())
		return // Cannot check for a non-product.

	// Ensure it's a product.
	const noProductResult = noProduct(input)
	if (noProductResult)
		return noProductResult

	// Check if the number of terms matches.
	if (correct.terms.length !== input.terms.length)
		return <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="wrongNumberOfProductFactors">There was supposed to be a product with {{ expectedNumTerms: correct.terms.length }} factors. Your response has {{ inputNumTerms: input.terms.length }} factors.</Translation>

	// Find an input term that is not in the solution.
	const index = input.terms.findIndex(inputTerm => !correct.terms.some(correctTerm => equivalent(inputTerm, correctTerm)))
	if (index !== -1)
		return <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="errorInProductFactors">There seems to be an error in the <CountingWord ordinal={true}>{index + 1}</CountingWord> factor of your solution.</Translation>
}

/*
 * Expression form checks.
 */

export const hasVariable = (variableName) => ((input, correct, { variables }, isCorrect) => !isCorrect && input.dependsOn(variables[variableName]) && <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="hasX">Your solution still contains <M>{variables[variableName]}</M>. It's not supposed to be there anymore.</Translation>)

export const hasX = hasVariable('x')

export const hasNumberSimplifications = (input, correct, solution, isCorrect) => !isCorrect && !areEqualExceptOrder(input.removeTrivial(), input.mergeNumbers()) && <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="hasNumberSimplifications">You can still simplify the numbers in your solution.</Translation>

export const hasSumWithinProduct = (input, correct, solution, isCorrect) => !isCorrect && expressionChecks.hasSumWithinProduct(input) && <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="hasSumWithinProduct">Your solution has unexpanded brackets.</Translation>

export const hasProductWithinPowerBase = (input, correct, solution, isCorrect) => !isCorrect && (expressionChecks.hasProductWithinPowerBase(input) || expressionChecks.hasPowerWithinPowerBase(input)) && <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="hasProductWithinPowerBase">Your solution has unexpanded brackets at a power.</Translation>

export const hasNegativeExponent = (input, correct, solution, isCorrect) => !isCorrect && (expressionChecks.hasNegativeExponent(input) && <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="hasNegativeExponent">The power <M>{input.find(term => term.isPower() && term.exponent.isMinus())}</M> in your input has a negative exponent.</Translation>)

export const hasSumWithinFraction = (input, correct, solution, isCorrect) => !isCorrect && expressionChecks.hasSumWithinFraction(input) && <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="hasSumWithinFraction">Your solution has an unseparated fraction.</Translation>

export const hasSimilarTerms = (input, correct, solution, isCorrect) => !isCorrect && expressionChecks.hasSimilarTerms(input) && <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="hasSimilarTerms">This can be simplified further: there is a sum with similar terms that can be merged together.</Translation>

export const hasFraction = (input, correct, solution, isCorrect) => !isCorrect && expressionChecks.hasFraction(input) && <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="hasFraction">Your solution still has a fraction. The idea was to remove all fractions.</Translation>

export const noFraction = (input, correct, solution, isCorrect) => !isCorrect && !input.flatten().isFraction() && <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="noFraction">Your solution is not a fraction. A single fraction was expected as answer.</Translation>

export const hasFractionWithinFraction = (input, correct, solution, isCorrect) => !isCorrect && expressionChecks.hasFractionWithinFraction(input) && <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="hasFractionWithinFraction">Your solution may not contain fractions within fractions. You can still simplify this further.</Translation>

export const hasXInDenominator = (input, correct, { variables }, isCorrect) => !isCorrect && expressionChecks.hasVariableInDenominator(input, variables.x) && <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="hasXInDenominator">You cannot have <M>{variables.x}</M> appear in any denominator anymore.</Translation>

export const unsimplifiedFractionNumbers = (input, correct, solution, isCorrect) => !isCorrect && !areEqualExceptOrder(input.flatten(['combineNumbersInProducts', 'combineNumbersInFractions']), input) && <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="unsimplifiedFractionNumbers">The fraction can still be simplified further. Try dividing the numerator and the denominator by the right number.</Translation>

export const unsimplifiedFractionFactors = (input, correct, solution, isCorrect) => !isCorrect && !areEqualExceptOrder(input.flatten(['combineLikeFactors', 'cancelFractionFactors', 'combineMinusSignsInProducts', 'removeDoubleNegatives']), input) && <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="unsimplifiedFractionFactors">There are still factors that can be canceled in the numerator and the denominator.</Translation>

export const fractionNumeratorHasSumWithinProduct = (input, correct, solution, isCorrect) => !isCorrect && input.isFraction() && expressionChecks.hasSumWithinProduct(input.numerator) && <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="fractionNumeratorHasSumWithinProduct">There are still unexpanded brackets in the numerator.</Translation>

export const hasPower = (input, correct, solution, isCorrect) => !isCorrect && expressionChecks.hasPower(input) && <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="hasPower">Your solution still has an exponent. You can simplify this further.</Translation>

export const unsimplifiedPowerMerging = (input, correct, solution, isCorrect) => !isCorrect && !areEqualExceptOrder(input.flatten(['combineLikeFactors']), input) && <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="unsimplifiedPowerMerging">There are still factors in a product that can be pulled together into a power.</Translation>

/*
 * Common mistake checks.
 */

export const wrongSign = (input, correct, solution, isCorrect) => !isCorrect && equivalent(input, correct.negate()) && <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="wrongSign">You haven't used the right sign. Check your pluses and minuses.</Translation>

export const invertedFraction = (input, correct, solution, isCorrect) => !isCorrect && equivalent(input, correct.invert()) && <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="incorrectFraction.inverted">You entered your fraction the wrong way around. Check carefuly through what factor you're dividing!</Translation>

export const incorrectFraction = (input, correct, solution, isCorrect) => {
	if (isCorrect)
		return
	input = input.flatten()
	if (correct.isFraction() && !input.isFraction())
		return <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="incorrectFraction.noFraction">Hmm ... a fraction was expected as a solution here.</Translation>
	const invertedFractionResult = invertedFraction(input, correct, solution, isCorrect)
	if (invertedFractionResult)
		return invertedFractionResult

	// If we didn't receive a Fraction, it's probably because accidentally things got canceled out and we remain with [stuff]/1. So put it back in that form.
	if (!correct.isFraction())
		correct = correct.divide(1)
	if (!areConstantMultiples(input.numerator, correct.numerator))
		return <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="incorrectFraction.incorrectNumerator">The numerator of your fraction (above) is not what was expected. Did you apply all the rules correctly?</Translation>
	if (!areConstantMultiples(input.denominator, correct.denominator))
		return <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="incorrectFraction.incorrectDenominator">The denominator of your fraction (below) is not what was expected. Did you apply all the rules correctly?</Translation>
	return <Translation folder={['eduTools']} catalog="feedback" group={['expression']} id="incorrectFraction.constantMultiple">You seem to be off by a constant multiple.</Translation>
}
