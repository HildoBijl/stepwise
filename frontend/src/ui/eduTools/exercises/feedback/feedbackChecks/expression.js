// This file contains various feedback checks that are used more commonly among exercises. They can be loaded in and used directly then.

import { Sum, Fraction, Integer, expressionChecks, expressionComparisons } from 'step-wise/CAS'

import { Translation, CountingWord } from 'i18n'
import { M } from 'ui/components'

const { onlyOrderChanges, equivalent, constantMultiple } = expressionComparisons

const translationPath = 'eduTools/feedback'

/*
 * Basic checks.
 */

export const originalExpression = (input, correct, { expression }, isCorrect) => {
	if (!expression)
		throw new Error(`Invalid originalExpression call: to use the originalExpression feedback check, there must be an "expression" parameter (the starting point) in the solution object to compare to. This is not present.`)
	return !isCorrect && onlyOrderChanges(input.elementaryClean(), expression.elementaryClean()) && <Translation path={translationPath} entry="expression.original">This is the original expression. You have not rewritten it yet.</Translation>
}

export const incorrectExpression = (input, correct, solution, isCorrect) => !isCorrect && !equivalent(input, correct) && <Translation path={translationPath} entry="expression.incorrect">This expression is not equal to what has been given. In rewriting it you took a wrong step somewhere.</Translation>

export const incorrectSolution = (input, correct, solution, isCorrect) => !isCorrect && !equivalent(input, correct) && <Translation path={translationPath} entry="expression.incorrectSolution">This is not the right solution, nor is it equivalent to it. Check your steps leading up to this.</Translation>

export const correctExpression = (input, correct, solution, isCorrect) => !isCorrect && equivalent(input, correct) && <Translation path={translationPath} entry="expression.correct">The expression is correct, but you have not done what was required.</Translation>

/*
 * Sum and terms checks.
 */

export const noSum = (input, correct, solution, isCorrect) => !isCorrect && !input.isSubtype(Sum) && <Translation path={translationPath} entry="expression.noSum">You have to write your solution as an addition/subtraction of terms. Your solution sadly is not an addition/subtraction.</Translation>

export const sumWithWrongTerms = (input, correct, solution, isCorrect) => {
	if (isCorrect)
		return

	// When the correct version is not a sum, something is wrong.
	if (!correct.isSubtype(Sum))
		throw new Error(`Invalid feedback function call: tried to check for a sum with wrong terms, but the correct answer wasn't a sum.`)

	// Ensure it's a sum.
	const noSumResult = noSum(input)
	if (noSumResult)
		return noSumResult

	// Check if the number of terms matches.
	if (correct.terms.length !== input.terms.length)
		return <Translation path={translationPath} entry="expression.wrongNumberOfSumTerms">There was supposed to be an addition/subtraction with {{ expectedNumTerms: correct.terms.length }} terms, each with a plus or minus sign in-between. Your response has {{ inputNumTerms: input.terms.length }} terms.</Translation>

	// Find an input term that is not in the solution.
	const index = input.terms.findIndex(inputTerm => !correct.terms.some(correctTerm => equivalent(inputTerm, correctTerm)))
	if (index !== -1)
		return <Translation path={translationPath} entry="expression.errorInSumTerm">There seems to be an error in the <CountingWord ordinal={true}>{index + 1}</CountingWord> term of your solution.</Translation>
}

export const sumWithUnsimplifiedTerms = (input, correct, solution, isCorrect) => {
	if (isCorrect)
		return

	// Run equivalence checks.
	const sumWithWrongTermsResult = sumWithWrongTerms(input, correct)
	if (sumWithWrongTermsResult)
		return sumWithWrongTermsResult

	// Find an input term that is not in the solution when checking only for order changes.
	const index = input.terms.findIndex(inputTerm => !correct.terms.some(correctTerm => onlyOrderChanges(inputTerm, correctTerm)))
	if (index !== -1)
		return <Translation path={translationPath} entry="expression.unsimplifiedSumTerm">You can still further simplify the <CountingWord ordinal={true}>{index + 1}</CountingWord> term of your solution.</Translation>
}

/*
 * Expression form checks.
 */

export const hasX = (input, correct, { variables }, isCorrect) => !isCorrect && input.dependsOn(variables.x) && <Translation path={translationPath} entry="expression.hasX">Your solution still contains <M>{variables.x}</M>. It's not supposed to be there anymore.</Translation>

export const hasSumWithinProduct = (input, correct, solution, isCorrect) => !isCorrect && expressionChecks.hasSumWithinProduct(input) && <Translation path={translationPath} entry="expression.hasSumWithinProduct">Your solution has unexpanded brackets.</Translation>

export const hasSumWithinFraction = (input, correct, solution, isCorrect) => !isCorrect && expressionChecks.hasSumWithinFraction(input) && <Translation path={translationPath} entry="expression.hasSumWithinFraction">Your solution has an unseparated fraction.</Translation>

export const hasSimilarTerms = (input, correct, solution, isCorrect) => !isCorrect && expressionChecks.hasSimilarTerms(input) && <Translation path={translationPath} entry="expression.hasSimilarTerms">This can be simplified further: there is a sum with similar terms that can be merged together.</Translation>

export const hasFraction = (input, correct, solution, isCorrect) => !isCorrect && expressionChecks.hasFraction(input) && <Translation path={translationPath} entry="expression.hasFraction">Your solution still has a fraction. The idea was to remove all fractions.</Translation>

export const noFraction = (input, correct, solution, isCorrect) => !isCorrect && !input.elementaryClean().isSubtype(Fraction) && <Translation path={translationPath} entry="expression.noFraction">Your solution is not a fraction. A single fraction was expected as answer.</Translation>

export const hasFractionWithinFraction = (input, correct, solution, isCorrect) => !isCorrect && expressionChecks.hasFractionWithinFraction(input) && <Translation path={translationPath} entry="expression.hasFractionWithinFraction">Your solution may not contain fractions within fractions. You can still simplify this further.</Translation>

export const unsimplifiedFractionNumbers = (input, correct, solution, isCorrect) => !isCorrect && !onlyOrderChanges(input.simplify({ mergeProductNumbers: true, crossOutFractionNumbers: true }), input) && <Translation path={translationPath} entry="expression.unsimplifiedFractionNumbers">The fraction can still be simplified further. Try dividing the numerator and the denominator by the right number.</Translation>

export const unsimplifiedFractionFactors = (input, correct, solution, isCorrect) => !isCorrect && !onlyOrderChanges(input.simplify({ mergeProductFactors: true, crossOutFractionFactors: true }), input) && <Translation path={translationPath} entry="expression.unsimplifiedFractionFactors">There are still factors that can be canceled in the numerator and the denominator.</Translation>

export const fractionNumeratorHasSumWithinProduct = (input, correct, solution, isCorrect) => !isCorrect && input.isSubtype(Fraction) && expressionChecks.hasSumWithinProduct(input.numerator) && <Translation path={translationPath} entry="expression.fractionNumeratorHasSumWithinProduct">There are still unexpanded brackets in the numerator.</Translation>

export const invertedFraction = (input, correct, solution, isCorrect) => !console.log(input.str, correct.invert().str, equivalent(input, correct.invert())) && !isCorrect && equivalent(input, correct.invert()) && <Translation path={translationPath} entry="expression.incorrectFraction.inverted">You entered your fraction the wrong way around. Check carefuly through what factor you're dividing!</Translation>

export const incorrectFraction = (input, correct, solution, isCorrect) => {
	if (isCorrect)
		return
	input = input.elementaryClean()
	if (correct.isSubtype(Fraction) && !input.isSubtype(Fraction))
		return <Translation path={translationPath} entry="expression.incorrectFraction.noFraction">Hmm ... a fraction was expected as a solution here.</Translation>
	const invertedFractionResult = invertedFraction(input, correct, solution, isCorrect)
	if (invertedFractionResult)
		return invertedFractionResult

	// If we didn't receive a Fraction, it's probably because accidentally things got canceled out and we remain with [stuff]/1. So put it back in that form.
	if (!correct.isSubtype(Fraction))
		correct = new Fraction({ numerator: correct, denominator: Integer.one })
	if (!constantMultiple(input.numerator, correct.numerator))
		return <Translation path={translationPath} entry="expression.incorrectFraction.incorrectNumerator">The numerator of your fraction (above) is not what was expected. Did you apply all the rules correctly?</Translation>
	if (!constantMultiple(input.denominator, correct.denominator))
		return <Translation path={translationPath} entry="expression.incorrectFraction.incorrectDenominator">The denominator of your fraction (below) is not what was expected. Did you apply all the rules correctly?</Translation>
	return <Translation path={translationPath} entry="expression.incorrectFraction.constantMultiple">You seem to be off by a constant multiple.</Translation>
}

export const hasPower = (input, correct, solution, isCorrect) => !isCorrect && expressionChecks.hasPower(input) && <Translation path={translationPath} entry="expression.hasPower">Your solution still has an exponent. You can simplify this further.</Translation>
