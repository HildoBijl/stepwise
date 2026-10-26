// This file contains various feedback checks that are used more commonly among exercises. They can be loaded in and used directly then.

import { findWithValue, resolveFunctionValuesDeep, resolveFunctionValue, identity } from '@step-wise/js-utils'
import { asEquationEqualityOptions, expressionComparisons, equationComparisons } from '@step-wise/cas'
import { Condition, Translation } from '@step-wise/i18n'

import { CountingWord } from 'i18n'
import { selectRandomCorrect, selectRandomIncorrect } from 'ui/inputs'

import * as expressionFeedbackChecks from './expression'


/*
 * Full equation feedback functions: the standard function whenever feedback options are given.
 */

export const fullEquationFeedback = (input, correct, solution, isCorrect, compare = {}) => {
	// On a correct entry, give a standard feedback message.
	if (isCorrect)
		return selectRandomCorrect()

	// Find the right processing and checking functions.
	const { preprocess, preprocessSide, preprocessLeft, preprocessRight, compareSide, compareLeft, compareRight, allowOrderChanges, allowSideSwitch } = asEquationEqualityOptions(resolveFunctionValue(compare, solution))
	input = preprocess(input)
	correct = preprocess(correct)

	// Determine the right preprocessing and compare functions.
	const prepLeft = preprocessLeft || preprocessSide || identity
	const prepRight = preprocessRight || preprocessSide || identity
	const defaultCompare = (a, b) => a.equalStructure(b, allowOrderChanges)
	const compLeft = compareLeft || compareSide || defaultCompare
	const compRight = compareRight || compareSide || defaultCompare

	// Check direct equality.
	const left = prepLeft(correct.left)
	const right = prepRight(correct.right)
	const isLeftSideCorrect = compLeft(prepLeft(input.left), left)
	const isRightSideCorrect = compRight(prepRight(input.right), right)
	if ((isLeftSideCorrect && !isRightSideCorrect) || (!isLeftSideCorrect && isRightSideCorrect))
		return oneSideCorrect(isLeftSideCorrect, isLeftSideCorrect ? expressionComparisons.areEquivalent(input.right, correct.right) : expressionComparisons.areEquivalent(input.left, correct.left))

	// Check if sides are mixed up.
	const correctLeftIsRight = compLeft(prepLeft(input.right), left)
	const correctRightIsLeft = compRight(prepRight(input.left), right)
	if (allowSideSwitch) {
		if (correctLeftIsRight || correctRightIsLeft)
			return oneSideCorrect(correctRightIsLeft, correctRightIsLeft ? expressionComparisons.areEquivalent(input.right, correct.left) : expressionComparisons.areEquivalent(input.left, correct.right))
	} else {
		if (correctLeftIsRight && correctRightIsLeft)
			return sidesSwitched()
		if (correctLeftIsRight || correctRightIsLeft)
			return oneSideSwitched(correctRightIsLeft)
	}

	// Check if the equation itself is still correct or incorrect.
	return incorrectEquation(input, correct, solution, isCorrect) || correctEquation(input, correct, solution, isCorrect) || selectRandomIncorrect()
}

// The following functions are support functions for the full-equation feedback functions, rendering specific (reusable if needed) feedback messages.
function oneSideCorrect(isLeftSideCorrect, isIncorrectSideEquivalent) {
	return <Translation folder={['eduTools']} catalog="feedback" group={['equation', 'fullFeedback']} id="oneSideCorrect">The <Condition value={isLeftSideCorrect}><Condition.True>left</Condition.True><Condition.False>right</Condition.False></Condition> side of the equation is correct, but something's wrong on the <Condition value={isLeftSideCorrect}><Condition.True>right</Condition.True><Condition.False>left</Condition.False></Condition> side. <Condition value={isIncorrectSideEquivalent}><Condition.True>You have not done what was required.</Condition.True><Condition.False>You took a wrong step somewhere.</Condition.False></Condition></Translation>
}
function sidesSwitched() {
	return <Translation folder={['eduTools']} catalog="feedback" group={['equation', 'fullFeedback']} id="sidesSwitched">Oops ... you have switched the left and the right side of the equation. Try switching them back!</Translation>
}
function oneSideSwitched(correctRightIsLeft) {
	return <Translation folder={['eduTools']} catalog="feedback" group={['equation', 'fullFeedback']} id="oneSideSwitched">The <Condition value={correctRightIsLeft}><Condition.True>left</Condition.True><Condition.False>right</Condition.False></Condition> side of your equation is correct, but it should be on the <Condition value={correctRightIsLeft}><Condition.True>right</Condition.True><Condition.False>left</Condition.False></Condition>. The <Condition value={correctRightIsLeft}><Condition.True>right</Condition.True><Condition.False>left</Condition.False></Condition> side of your equation still has some errors you might want to look at.</Translation>
}

/*
 * Basic checks for extra feedback options.
 */

export const originalEquation = (input, correct, { equation }) => equationComparisons.areEqualExceptOrder(input, equation) && <Translation folder={['eduTools']} catalog="feedback" group={['equation']} id="original">This is the original equation. You have not rewritten it yet.</Translation>

export const incorrectEquation = (input, correct, solution, isCorrect) => !isCorrect && !equationComparisons.areEquivalent(input, correct) && <Translation folder={['eduTools']} catalog="feedback" group={['equation']} id="incorrect">This equation is not equal to what has been given. In rewriting it you took a wrong step somewhere.</Translation>

export const hasIncorrectLeftSide = (input, correct, solution, isCorrect) => !isCorrect && !expressionComparisons.areEquivalent(input.left, correct.left) && !expressionComparisons.areEquivalent(input.left, correct.right) && <Translation folder={['eduTools']} catalog="feedback" group={['equation']} id="incorrectLeftSide">The left side of the equation is not what was expected.</Translation>
export const hasIncorrectRightSide = (input, correct, solution, isCorrect) => !isCorrect && !expressionComparisons.areEquivalent(input.right, correct.right) && !expressionComparisons.areEquivalent(input.right, correct.left) && <Translation folder={['eduTools']} catalog="feedback" group={['equation']} id="incorrectRightSide">The right side of the equation is not what was expected.</Translation>
export const hasIncorrectSide = (...args) => hasIncorrectLeftSide(...args) || hasIncorrectRightSide(...args)

export const correctEquationWithMessage = (message) => ((input, correct, solution, isCorrect, exerciseData) => !isCorrect && equationComparisons.areEquivalent(input, correct) && resolveFunctionValuesDeep(message, input, correct, solution, isCorrect, exerciseData))

export const correctEquation = correctEquationWithMessage(<Translation folder={['eduTools']} catalog="feedback" group={['equation']} id="correct">The equation is correct, but you have not done what was required.</Translation>)

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
		if (correctSide.isSum() && !inputSide.isSum())
			return <Translation folder={['eduTools']} catalog="feedback" group={['equation']} id="noSum">You have only written a single term on the <Condition value={atLeft}><Condition.True>left</Condition.True><Condition.False>right</Condition.False></Condition> side. A sum was expected here: an addition/subtraction of terms.</Translation>
		if (!correctSide.isSum() && inputSide.isSum())
			return <Translation folder={['eduTools']} catalog="feedback" group={['equation']} id="hasSum">You have written a sum on the <Condition value={atLeft}><Condition.True>left</Condition.True><Condition.False>right</Condition.False></Condition> side: an addition/subtraction of terms. Only a single term was expected here.</Translation>
	}

	// Check sides for any problem and return the first problem we find.
	return (findWithValue(['left', 'right'], inspectSide) || {}).value
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
		if (correctSide.isSum()) {
			// Check that it has the right number of terms.
			if (correctSide.terms.length !== inputSide.terms.length)
				return <Translation folder={['eduTools']} catalog="feedback" group={['equation']} id="wrongNumberOfSumTerms">The sum on the <Condition value={atLeft}><Condition.True>left</Condition.True><Condition.False>right</Condition.False></Condition> side of the equals sign has <CountingWord>{inputSide.terms.length}</CountingWord> terms. There were <CountingWord>{correctSide.terms.length}</CountingWord> terms expected.</Translation>

			// Find an input term that is not in the solution.
			const index = inputSide.terms.findIndex(inputTerm => !correctSide.terms.some(correctTerm => expressionComparisons.areEquivalent(inputTerm, correctTerm)))
			if (index !== -1)
				return <Translation folder={['eduTools']} catalog="feedback" group={['equation']} id="errorInSumTerm">There seems to be an error in the <CountingWord ordinal={true}>{index + 1}</CountingWord> term on the <Condition value={atLeft}><Condition.True>left</Condition.True><Condition.False>right</Condition.False></Condition> side.</Translation>
		} else {
			// Check that the given terms are the same.
			if (!expressionComparisons.areEquivalent(inputSide, correctSide))
				return <Translation folder={['eduTools']} catalog="feedback" group={['equation']} id="errorInSide">There seems to be an error in the <Condition value={atLeft}><Condition.True>left</Condition.True><Condition.False>right</Condition.False></Condition> side of the equation.</Translation>
		}
	}

	// Check sides for any problem and return the first problem we find.
	return (findWithValue(['left', 'right'], inspectSide) || {}).value
}

// sumWithUnsimplifiedTerms checks if the left and right side have the same form. When terms are equivalent but do not match the areEqualExceptOrder check, it notes that further simplifications are possible.
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
		if (correctSide.isSum()) {
			// Find an input term that is not in the solution when checking only for order changes.
			const index = inputSide.terms.findIndex(inputTerm => !correctSide.terms.some(correctTerm => expressionComparisons.areEqualExceptOrder(inputTerm, correctTerm)))
			if (index !== -1)
				return <Translation folder={['eduTools']} catalog="feedback" group={['equation']} id="unsimplifiedSumTerm">You can still simplify the <CountingWord ordinal={true}>{index + 1}</CountingWord> term on the <Condition value={atLeft}><Condition.True>left</Condition.True><Condition.False>right</Condition.False></Condition> side.</Translation>
		} else {
			// Check that the given terms are the same.
			if (!expressionComparisons.areEqualExceptOrder(inputSide, correctSide))
				return <Translation folder={['eduTools']} catalog="feedback" group={['equation']} id="unsimplifiedSide">You can still simplify the <Condition value={atLeft}><Condition.True>left</Condition.True><Condition.False>right</Condition.False></Condition> side.</Translation>
		}
	}

	// Check sides for any problem and return the first problem we find.
	return (findWithValue(['left', 'right'], inspectSide) || {}).value
}

/*
 * Form of equation checks.
 */

export const hasSumWithinProduct = (input, correct, solution, isCorrect) => expressionFeedbackChecks.hasSumWithinProduct(input.left, correct.left, solution, isCorrect) || expressionFeedbackChecks.hasSumWithinProduct(input.right, correct.right, solution, isCorrect)

export const hasSumWithinFraction = (input, correct, solution, isCorrect) => expressionFeedbackChecks.hasSumWithinFraction(input.left, correct.left, solution, isCorrect) || expressionFeedbackChecks.hasSumWithinFraction(input.right, correct.right, solution, isCorrect)

export const hasFraction = (input, correct, solution, isCorrect) => expressionFeedbackChecks.hasFraction(input.left, correct.left, solution, isCorrect) || expressionFeedbackChecks.hasFraction(input.right, correct.right, solution, isCorrect)

export const hasFractionWithinFraction = (input, correct, solution, isCorrect) => expressionFeedbackChecks.hasFractionWithinFraction(input.left, correct.left, solution, isCorrect) || expressionFeedbackChecks.hasFractionWithinFraction(input.right, correct.right, solution, isCorrect)

export const hasXInDenominator = (input, correct, solution, isCorrect) => expressionFeedbackChecks.hasXInDenominator(input.left, correct.left, solution, isCorrect) || expressionFeedbackChecks.hasXInDenominator(input.right, correct.right, solution, isCorrect)
