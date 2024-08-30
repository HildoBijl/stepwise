// This file contains various feedback checks that are used more commonly among exercises. They can be loaded in and used directly then.

import { arrayFind, resolveFunctions, resolveFunctionsShallow, processOptions } from 'step-wise/util'
import { Sum, Equation, expressionComparisons, equationComparisons, equationChecks } from 'step-wise/CAS'

import { Translation, Check, CountingWord } from 'i18n'
import { M } from 'ui/components'
import { selectRandomCorrect, selectRandomIncorrect } from 'ui/inputs'

const translationPath = 'eduTools/feedback'

/*
 * Full equation feedback functions: the standard function whenever feedback options are given.
 */

export const fullEquationFeedback = (input, correct, solution, isCorrect, comparison = {}) => {
	// On a correct entry, give a standard feedback message.
	if (isCorrect)
		return selectRandomCorrect()

	// Find the right processing and checking functions.
	comparison = processOptions(resolveFunctionsShallow(comparison, solution), Equation.defaultEqualsOptions)
	const leftPreprocess = comparison.leftPreprocess || comparison.preprocess
	const rightPreprocess = comparison.leftPreprocess || comparison.preprocess
	const leftCheck = comparison.leftCheck || comparison.check
	const rightCheck = comparison.richtCheck || comparison.check

	// Check direct equality.
	const left = leftPreprocess(correct.left)
	const right = rightPreprocess(correct.right)
	const isLeftSideCorrect = leftCheck(leftPreprocess(input.left), left, comparison)
	const isRightSideCorrect = rightCheck(rightPreprocess(input.right), right, comparison)
	if ((isLeftSideCorrect && !isRightSideCorrect) || (!isLeftSideCorrect && isRightSideCorrect))
		return oneSideCorrect(isLeftSideCorrect, isLeftSideCorrect ? expressionComparisons.equivalent(input.right, correct.right) : expressionComparisons.equivalent(input.left, correct.left))

	// Check if sides are mixed up.
	const leftIsRight = leftCheck(leftPreprocess(input.right), left, comparison)
	const rightIsLeft = rightCheck(rightPreprocess(input.left), right, comparison)
	if (comparison.allowSwitch) {
		if (leftIsRight || rightIsLeft)
			return oneSideCorrect(leftIsRight, leftIsRight ? expressionComparisons.equivalent(input.right, correct.left) : expressionComparisons.equivalent(input.left, correct.right))
	} else {
		if (leftIsRight && rightIsLeft)
			return sidesSwitched()
		if (leftIsRight || rightIsLeft)
			return oneSideSwitched(leftIsRight)
	}

	// Check if the equation itself is still correct or incorrect.
	return incorrectEquation(input, correct, solution, isCorrect) || correctEquation(input, correct, solution, isCorrect) || selectRandomIncorrect()
}

// The following functions are support functions for the full-equation feedback functions, rendering specific (reusable if needed) feedback messages.
function oneSideCorrect(isLeftSideCorrect, isIncorrectSideEquivalent) {
	return <Translation path={translationPath} entry="equation.fullFeedback.oneSideCorrect">The <Check value={isLeftSideCorrect}><Check.True>left</Check.True><Check.False>right</Check.False></Check> side of the equation is correct, but something's wrong on the <Check value={isLeftSideCorrect}><Check.True>right</Check.True><Check.False>left</Check.False></Check> side. <Check value={isIncorrectSideEquivalent}><Check.True>You have not done what was required.</Check.True><Check.False>You took a wrong step somewhere.</Check.False></Check></Translation>
}
function sidesSwitched() {
	return <Translation path={translationPath} entry="equation.fullFeedback.sidesSwitched">Oops ... you have switched the left and the right side of the equation. Try switching them back!</Translation>
}
function oneSideSwitched(leftIsRight) {
	return <Translation path={translationPath} entry="equation.fullFeedback.oneSideSwitched">The <Check value={leftIsRight}><Check.True>left</Check.True><Check.False>right</Check.False></Check> side of your equation is correct, but it should be on the <Check value={leftIsRight}><Check.True>right</Check.True><Check.False>left</Check.False></Check>. The <Check value={leftIsRight}><Check.True>right</Check.True><Check.False>left</Check.False></Check> side of your equation still has some errors you might want to look at.</Translation>
}

/*
 * Basic checks for extra feedback options.
 */

export const originalEquation = (input, correct, { equation }) => equationComparisons.onlyOrderChanges(input, equation) && <Translation path={translationPath} entry="equation.original">This is the original equation. You have not rewritten it yet.</Translation>

export const incorrectEquation = (input, correct, solution, isCorrect) => !isCorrect && !equationComparisons.equivalent(input, correct) && <Translation path={translationPath} entry="equation.incorrect">This equation is not equal to what has been given. In rewriting it you took a wrong step somewhere.</Translation>

export const hasIncorrectLeftSide = (input, correct, solution, isCorrect) => !isCorrect && !expressionComparisons.equivalent(input.left, correct.left) && !expressionComparisons.equivalent(input.left, correct.right) && <Translation path={translationPath} entry="equation.incorrectLeftSide">The left side of the equation is not what was expected.</Translation>
export const hasIncorrectRightSide = (input, correct, solution, isCorrect) => !isCorrect && !expressionComparisons.equivalent(input.right, correct.right) && !expressionComparisons.equivalent(input.right, correct.left) && <Translation path={translationPath} entry="equation.incorrectRightSide">The right side of the equation is not what was expected.</Translation>
export const hasIncorrectSide = (...args) => hasIncorrectLeftSide(...args) || hasIncorrectRightSide(...args)

export const correctEquationWithMessage = (message) => ((input, correct, solution, isCorrect, exerciseData) => !isCorrect && equationComparisons.equivalent(input, correct) && resolveFunctions(message, input, correct, solution, isCorrect, exerciseData))

export const correctEquation = correctEquationWithMessage(<Translation path={translationPath} entry="equation.correct">The equation is correct, but you have not done what was required.</Translation>)

/*
 * Sum and terms checks.
 */

// noSum checks whether both sides have a sum or not. If this differs between the input and the correct answer, the problem is noted.
export const noSum = (input, correct, solution, isCorrect) => {
	if (isCorrect)
		return

	// Define a handler that inspects a given side (left or right).
	const inspectSide = (side) => {
		const correctSide = correct[side]
		const inputSide = input[side]
		const atLeft = side === 'left'

		// If the correct answer has a sum ...
		if (correctSide.isSubtype(Sum) && !inputSide.isSubtype(Sum))
			return <Translation path={translationPath} entry="equation.noSum">You have only written a single term on the <Check value={atLeft}><Check.True>left</Check.True><Check.False>right</Check.False></Check> side. A sum was expected here: an addition/subtraction of terms.</Translation>
		if (!correctSide.isSubtype(Sum) && inputSide.isSubtype(Sum))
			return <Translation path={translationPath} entry="equation.hasSum">You have written a sum on the <Check value={atLeft}><Check.True>left</Check.True><Check.False>right</Check.False></Check> side: an addition/subtraction of terms. Only a single term was expected here.</Translation>
	}

	// Check sides for any problem and return the first problem we find.
	return (arrayFind(['left', 'right'], inspectSide) || {}).value
}

// sumWithWrongTerms checks that both sides have a sum of the same form. It also checks the terms and when they're not equivalent indicates which term has a problem.
export const sumWithWrongTerms = (input, correct, solution, isCorrect) => {
	if (isCorrect)
		return

	// Check earlier simpler cases.
	const noSumResult = noSum(input, correct)
	if (noSumResult)
		return noSumResult

	// Define a handler that inspects a given side (left or right).
	const inspectSide = (side) => {
		const correctSide = correct[side]
		const inputSide = input[side]
		const atLeft = side === 'left'

		// If the correct answer has a sum ...
		if (correctSide.isSubtype(Sum)) {
			// Check that it has the right number of terms.
			if (correctSide.terms.length !== inputSide.terms.length)
				return <Translation path={translationPath} entry="equation.wrongNumberOfSumTerms">The sum on the <Check value={atLeft}><Check.True>left</Check.True><Check.False>right</Check.False></Check> side of the equals sign has <CountingWord>{inputSide.terms.length}</CountingWord> terms. <CountingWord upperCase={true}>{correctSide.terms.length}</CountingWord> terms were expected.</Translation>

			// Find an input term that is not in the solution.
			const index = inputSide.terms.findIndex(inputTerm => !correctSide.terms.some(correctTerm => expressionComparisons.equivalent(inputTerm, correctTerm)))
			if (index !== -1)
				return <Translation path={translationPath} entry="equation.errorInSumTerm">There seems to be an error in the <CountingWord ordinal={true}>{index + 1}</CountingWord> term on the <Check value={atLeft}><Check.True>left</Check.True><Check.False>right</Check.False></Check> side.</Translation>
		} else {
			// Check that the given terms are the same.
			if (!expressionComparisons.equivalent(inputSide, correctSide))
				return <Translation path={translationPath} entry="equation.errorInSide">There seems to be an error in the <Check value={atLeft}><Check.True>left</Check.True><Check.False>right</Check.False></Check> side of the equation.</Translation>
		}
	}

	// Check sides for any problem and return the first problem we find.
	return (arrayFind(['left', 'right'], inspectSide) || {}).value
}

// sumWithUnsimplifiedTerms checks if the left and right side have the same form. When terms are equivalent but do not match the onlyOrderChanges check, it notes that further simplifications are possible.
export const sumWithUnsimplifiedTerms = (input, correct, solution, isCorrect) => {
	if (isCorrect)
		return

	// Check earlier simpler cases.
	const sumWithWrongTermsResult = sumWithWrongTerms(input, correct)
	if (sumWithWrongTermsResult)
		return sumWithWrongTermsResult

	// Define a handler that inspects a given side (left or right).
	const inspectSide = (side) => {
		const correctSide = correct[side]
		const inputSide = input[side]
		const atLeft = side === 'left'

		// If the correct answer has a sum ...
		if (correctSide.isSubtype(Sum)) {
			// Find an input term that is not in the solution when checking only for order changes.
			const index = inputSide.terms.findIndex(inputTerm => !correctSide.terms.some(correctTerm => expressionComparisons.onlyOrderChanges(inputTerm, correctTerm)))
			if (index !== -1)
				return <Translation path={translationPath} entry="equation.unsimplifiedSumTerm">You can still simplify the <CountingWord ordinal={true}>{index + 1}</CountingWord> term on the <Check value={atLeft}><Check.True>left</Check.True><Check.False>right</Check.False></Check> side.</Translation>
		} else {
			// Check that the given terms are the same.
			if (!expressionComparisons.onlyOrderChanges(inputSide, correctSide))
				return <Translation path={translationPath} entry="equation.unsimplifiedSide">You can still simplify the <Check value={atLeft}><Check.True>left</Check.True><Check.False>right</Check.False></Check> side.</Translation>
		}
	}

	// Check sides for any problem and return the first problem we find.
	return (arrayFind(['left', 'right'], inspectSide) || {}).value
}

/*
 * Form of equation checks.
 */

export const hasSumWithinProduct = (input, correct, solution, isCorrect) => !isCorrect && equationChecks.hasSumWithinProduct(input) && <Translation path={translationPath} entry="equation.hasSumWithinProduct">Your solution has unexpanded brackets.</Translation>

export const hasSumWithinFraction = (input, correct, solution, isCorrect) => !isCorrect && equationChecks.hasSumWithinFraction(input) && <Translation path={translationPath} entry="equation.hasSumWithinFraction">Your solution has an unseparated fraction.</Translation>

export const hasFraction = (input, correct, solution, isCorrect) => !isCorrect && equationChecks.hasFraction(input) && <Translation path={translationPath} entry="equation.hasFraction">Your solution still has a fraction. The idea was to remove all fractions.</Translation>

export const hasFractionWithinFraction = (input, correct, solution, isCorrect) => !isCorrect && equationChecks.hasFractionWithinFraction(input) && <Translation path={translationPath} entry="equation.hasFractionWithinFraction">Your solution may not contain fractions within fractions. You can still simplify this further.</Translation>

export const hasFractionWithX = (input, correct, { variables }, isCorrect) => !isCorrect && equationChecks.hasFractionSatisfying(input, fraction => fraction.denominator.dependsOn(variables.x)) && <Translation path={translationPath} entry="equation.hasFractionWithX">Your solution still has a fraction with <M>{variables.x}</M> in the denominator. The idea was to not have these occurrences.</Translation>
