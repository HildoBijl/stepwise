// This file contains various feedback checks that are used more commonly among exercises. They can be loaded in and used directly then.

import { Sum, Fraction, expressionChecks } from 'step-wise/CAS'

import { M } from 'ui/components/equations'

/*
 * Basic checks.
 */

export const originalExpression = (input, correct, { expression }) => expressionChecks.onlyOrderChanges(input, expression) && <>Dit is de oorspronkelijke uitdrukking. Je hebt hier nog niets mee gedaan.</>

export const incorrectExpression = (input, correct, solution, isCorrect) => !isCorrect && !expressionChecks.equivalent(input, correct) && <>Deze uitdrukking is niet gelijk aan wat gegeven is. Je hebt bij het omschrijven iets gedaan dat niet mag.</>

export const correctExpression = (input, correct, solution, isCorrect) => !isCorrect && expressionChecks.equivalent(input, correct) && <>De uitdrukking klopt wel, maar je hebt niet gedaan wat gevraagd is.</>

/*
 * Sum and terms checks.
 */

export const noSum = (input, correct, solution, isCorrect) => !isCorrect && !input.isType(Sum) && <>Je moet je antwoord schrijven als een optelling/aftrekking van termen. Je gegeven antwoord is helaas geen optelling/aftrekking.</>

export const sumWithWrongTerms = (input, correct, solution, isCorrect) => {
	if (isCorrect)
		return

	// Ensure it's a sum.
	const noSumResult = noSum(input)
	if (noSumResult)
		return noSumResult

	// Check if the number of terms matches.
	if (correct.terms.length !== input.terms.length)
		return <>Je optelsom moet bestaan uit {correct.terms.length} termen, met een plus of minteken ertussen. Nu heb je {input.terms.length} termen.</>

	// Find an input term that is not in the solution.
	const index = input.terms.findIndex(inputTerm => !correct.terms.some(correctTerm => expressionChecks.equivalent(inputTerm, correctTerm)))
	if (index !== -1)
		return [
			<>Er lijkt iets mis te zijn met de eerste term van je antwoord.</>,
			<>Er lijkt iets mis te zijn met de tweede term van je antwoord.</>,
			<>Er lijkt iets mis te zijn met de derde term van je antwoord.</>,
			<>Er lijkt iets mis te zijn met de vierde term van je antwoord.</>,
			<>Er lijkt iets mis te zijn met de vijfde term van je antwoord.</>,
			<>Er lijkt iets mis te zijn met de zesde term van je antwoord.</>,
			<>Er lijkt iets mis te zijn met term {index + 1} van je antwoord.</>,
		][index]
}

export const sumWithUnsimplifiedTerms = (input, correct, solution, isCorrect) => {
	if (isCorrect)
		return

	// Run equivalence checks.
	const sumWithWrongTermsResult = sumWithWrongTerms(input, correct)
	if (sumWithWrongTermsResult)
		return sumWithWrongTermsResult

	// Find an input term that is not in the solution when checking only for order changes.
	const index = input.terms.findIndex(inputTerm => !correct.terms.some(correctTerm => expressionChecks.onlyElementaryClean(inputTerm, correctTerm)))
	if (index !== -1)
		return [
			<>Je kunt de eerste term van je antwoord nog verder vereenvoudigen.</>,
			<>Je kunt de tweede term van je antwoord nog verder vereenvoudigen.</>,
			<>Je kunt de derde term van je antwoord nog verder vereenvoudigen.</>,
			<>Je kunt de vierde term van je antwoord nog verder vereenvoudigen.</>,
			<>Je kunt de vijfde term van je antwoord nog verder vereenvoudigen.</>,
			<>Je kunt de zesde term van je antwoord nog verder vereenvoudigen.</>,
			<>Je kunt term {index + 1} van je antwoord nog verder vereenvoudigen.</>,
		][index]
}

/*
 * Expression form checks.
 */

export const hasSumWithinProduct = (input, correct, solution, isCorrect) => !isCorrect && expressionChecks.hasSumWithinProduct(input) && <>Je antwoord heeft onuitgewerkte haakjes.</>

export const hasSumWithinFraction = (input, correct, solution, isCorrect) => !isCorrect && expressionChecks.hasSumWithinFraction(input) && <>Je antwoord heeft nog een niet-opgesplitste breuk.</>

export const hasFraction = (input, correct, solution, isCorrect) => !isCorrect && expressionChecks.hasFraction(input) && <>Je antwoord heeft nog een breuk. Het idee was om alle breuken weg te halen.</>

export const noFraction = (input, correct, solution, isCorrect) => !isCorrect && !input.isType(Fraction) && <>Je antwoord is geen breuk. Er wordt een enkele breuk als antwoord verwacht.</>

export const hasFractionWithinFraction = (input, correct, solution, isCorrect) => !isCorrect && expressionChecks.hasFractionWithinFraction(input) && <>Je antwoord mag geen verdere breuken binnenin een breuk bevatten. Je kunt het nog verder simplificeren.</>

export const hasX = (input, correct, { variables }, isCorrect) => !isCorrect && input.dependsOn(variables.x) && <>Je antwoord bevat nog een <M>{variables.x}.</M> Dat was niet de bedoeling!</>

export const incorrectFraction = (input, correct, { variables }, isCorrect) => {
	if (isCorrect)
		return
	input = input.elementaryClean()
	if (!input.isType(Fraction))
		return <>Hmm ... er was eigenlijk een breuk als antwoord verwacht.</>
	if (expressionChecks.equivalent(input, correct.invert()))
		return <>Je hebt je breuk verkeerd om ingevuld. Kijk goed wat je waardoor moet delen!</>
	if (!expressionChecks.constantMultiple(input.numerator, correct.numerator))
		return <>De teller van je breuk is niet wat verwacht werd. Zijn dit wel alle termen zonder <M>{variables.x}?</M></>
	if (!expressionChecks.constantMultiple(input.denominator, correct.denominator))
		return <>De noemer van je breuk is niet wat verwacht werd. Heb je <M>{variables.x}</M> wel op de juiste manier buiten haakjes gehaald?</>
	return <>Je lijkt er een constante vermenigvuldiging naast te zitten.</>
}