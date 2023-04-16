// This file contains various feedback checks that are used more commonly among exercises. They can be loaded in and used directly then.

import { arrayFind } from 'step-wise/util/arrays'
import { resolveFunctions } from 'step-wise/util/functions'
import { Sum, expressionComparisons, equationComparisons, equationChecks } from 'step-wise/CAS'

import { M } from 'ui/components'

/*
 * Basic checks.
 */

export const originalEquation = (input, correct, { equation }) => equationComparisons.onlyOrderChanges(input, equation) && <>Dit is de oorspronkelijke vergelijking. Je hebt hier nog niets mee gedaan.</>

export const incorrectEquation = (input, correct, solution, isCorrect) => !isCorrect && !equationComparisons.equivalent(input, correct) && <>Deze vergelijking klopt niet. Je hebt bij het omschrijven iets gedaan dat niet mag.</>

export const hasIncorrectLeftSide = (input, correct, solution, isCorrect) => !isCorrect && !expressionComparisons.equivalent(input.left, correct.left) && !expressionComparisons.equivalent(input.left, correct.right) && <>De linkerkant van de vergelijking is niet wat verwacht werd.</>
export const hasIncorrectRightSide = (input, correct, solution, isCorrect) => !isCorrect && !expressionComparisons.equivalent(input.right, correct.right) && !expressionComparisons.equivalent(input.right, correct.left) && <>De rechterkant van de vergelijking is niet wat verwacht werd.</>
export const hasIncorrectSide = (...args) => hasIncorrectLeftSide(...args) || hasIncorrectRightSide(...args)

export const correctEquationWithMessage = (message) => ((input, correct, solution, isCorrect, exerciseData) => !isCorrect && equationComparisons.equivalent(input, correct) && resolveFunctions(message, input, correct, solution, isCorrect, exerciseData))

export const correctEquation = correctEquationWithMessage(<>De vergelijking klopt wel, maar je hebt niet gedaan wat gevraagd werd.</>)

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
			return <>Je hebt aan de {atLeft ? 'linker' : 'rechter'} kant slechts een enkele term gegeven. Hier werd een som verwacht: een optelling/aftrekking van termen.</>
		if (!correctSide.isSubtype(Sum) && inputSide.isSubtype(Sum))
			return <>Je hebt aan de {atLeft ? 'linker' : 'rechter'} kant een som gezet: een optelling/aftrekking van termen. Hier werd maar één term verwacht.</>
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
				return <>De optelsom {atLeft ? 'links' : 'rechts'} van het is-teken heeft {inputSide.terms.length} termen. Er werden er {correctSide.terms.length} verwacht.</>

			// Find an input term that is not in the solution.
			const index = inputSide.terms.findIndex(inputTerm => !correctSide.terms.some(correctTerm => expressionComparisons.equivalent(inputTerm, correctTerm)))
			if (index !== -1)
				return [
					<>Er lijkt iets mis te zijn met de eerste term aan de {atLeft ? 'linker' : 'rechter'} kant.</>,
					<>Er lijkt iets mis te zijn met de tweede term aan de {atLeft ? 'linker' : 'rechter'} kant.</>,
					<>Er lijkt iets mis te zijn met de derde term aan de {atLeft ? 'linker' : 'rechter'} kant.</>,
					<>Er lijkt iets mis te zijn met de vierde term aan de {atLeft ? 'linker' : 'rechter'} kant.</>,
					<>Er lijkt iets mis te zijn met de vijfde term aan de {atLeft ? 'linker' : 'rechter'} kant.</>,
					<>Er lijkt iets mis te zijn met de zesde term aan de {atLeft ? 'linker' : 'rechter'} kant.</>,
					<>Er lijkt iets mis te zijn met term {index + 1} aan de {atLeft ? 'linker' : 'rechter'} kant.</>,
				][index]
		} else {
			// Check that the given terms are the same.
			if (!expressionComparisons.equivalent(inputSide, correctSide))
				return <>Er lijkt iets mis te zijn met de term aan de {atLeft ? 'linker' : 'rechter'} kant.</>
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
			const index = inputSide.terms.findIndex(inputTerm => !correctSide.terms.some(correctTerm => expressionComparisons.onlyElementaryClean(inputTerm, correctTerm)))
			if (index !== -1)
				return [
					<>Je kunt de eerste term aan de {atLeft ? 'linker' : 'rechter'} kant nog verder vereenvoudigen.</>,
					<>Je kunt de tweede term aan de {atLeft ? 'linker' : 'rechter'} kant nog verder vereenvoudigen.</>,
					<>Je kunt de derde term aan de {atLeft ? 'linker' : 'rechter'} kant nog verder vereenvoudigen.</>,
					<>Je kunt de vierde term aan de {atLeft ? 'linker' : 'rechter'} kant nog verder vereenvoudigen.</>,
					<>Je kunt de vijfde term aan de {atLeft ? 'linker' : 'rechter'} kant nog verder vereenvoudigen.</>,
					<>Je kunt de zesde term aan de {atLeft ? 'linker' : 'rechter'} kant nog verder vereenvoudigen.</>,
					<>Je kunt term {index + 1} aan de {atLeft ? 'linker' : 'rechter'} kant nog verder vereenvoudigen.</>,
				][index]
		} else {
			// Check that the given terms are the same.
			if (!expressionComparisons.onlyElementaryClean(inputSide, correctSide))
				return <>Je kunt de {atLeft ? 'linker' : 'rechter'} kant nog verder vereenvoudigen.</>
		}
	}

	// Check sides for any problem and return the first problem we find.
	return (arrayFind(['left', 'right'], inspectSide) || {}).value
}

/*
 * Form of equation checks.
 */

export const hasSumWithinProduct = (input, correct, solution, isCorrect) => !isCorrect && equationChecks.hasSumWithinProduct(input) && <>Je antwoord heeft onuitgewerkte haakjes.</>

export const hasSumWithinFraction = (input, correct, solution, isCorrect) => !isCorrect && equationChecks.hasSumWithinFraction(input) && <>Je antwoord heeft nog een niet-opgesplitste breuk.</>

export const hasFraction = (input, correct, solution, isCorrect) => !isCorrect && equationChecks.hasFraction(input) && <>Je antwoord heeft nog een breuk. Het idee was om alle breuken weg te halen.</>

export const hasFractionWithinFraction = (input, correct, solution, isCorrect) => !isCorrect && equationChecks.hasFractionWithinFraction(input) && <>Je antwoord mag geen verdere breuken binnenin een breuk bevatten. Je kunt het nog verder simplificeren.</>

export const hasFractionWithX = (input, correct, { variables }, isCorrect) => !isCorrect && equationChecks.hasFractionSatisfying(input, fraction => fraction.denominator.dependsOn(variables.x)) && <>Je antwoord heeft nog een breuk met <M>{variables.x}</M> in de noemer. Het idee was om dit juist niet meer te hebben.</>