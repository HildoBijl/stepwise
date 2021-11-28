// This file contains various feedback checks that are used more commonly among exercises. They can be loaded in and used directly then.

import { Sum, Fraction, expressionChecks, equationChecks } from 'step-wise/CAS'

const { onlyOrderChanges: onlyExpressionOrderChanges, equivalent: equivalentExpression } = expressionChecks
const { onlyOrderChanges: onlyEquationOrderChanges, equivalent: equivalentEquation } = equationChecks

/*
 * Basic checks.
 */

export const originalExpression = {
	check: (correct, input, { expression }) => onlyExpressionOrderChanges(input, expression),
	text: <>Dit is de oorspronkelijke uitdrukking. Je hebt hier nog niets mee gedaan.</>,
}
export const correctExpression = {
	check: (correct, input) => equivalentExpression(correct, input),
	text: <>De uitdrukking klopt wel, maar je hebt niet gedaan wat gevraagd is.</>,
}
export const incorrectExpression = {
	check: (correct, input) => !equivalentExpression(correct, input),
	text: <>Deze uitdrukking is niet gelijk aan wat gegeven is. Je hebt bij het omschrijven iets gedaan dat niet mag.</>,
}

/*
 * Sum and terms checks.
 */

export const noSum = {
	check: (correct, input) => !input.isType(Sum),
	text: <>Je moet je antwoord schrijven als een optelling/aftrekking van termen. Je gegeven antwoord is helaas geen optelling/aftrekking.</>,
}
export const sumWithWrongTermsNumber = {
	check: (correct, input) => correct.terms.length !== input.terms.length,
	text: (correct, input) => <>Je optelsom moet bestaan uit {correct.terms.length} termen, met een plus of minteken ertussen. Nu heb je {input.terms.length} termen.</>,
}
export const wrongFirstTerm = {
	check: (correct, input) => !correct.terms.some(term => equivalentExpression(term, input.terms[0])),
	text: <>Er lijkt iets mis te zijn met de eerste term van je antwoord.</>,
}
export const wrongSecondTerm = {
	check: (correct, input) => !correct.terms.some(term => equivalentExpression(term, input.terms[1])),
	text: <>Er lijkt iets mis te zijn met de tweede term van je antwoord.</>,
}
export const wrongThirdTerm = {
	check: (correct, input) => !correct.terms.some(term => equivalentExpression(term, input.terms[2])),
	text: <>Er lijkt iets mis te zijn met de derde term van je antwoord.</>,
}
export const wrongFourthTerm = {
	check: (correct, input) => !correct.terms.some(term => equivalentExpression(term, input.terms[3])),
	text: <>Er lijkt iets mis te zijn met de vierde term van je antwoord.</>,
}

/*
 * Expression form checks.
 */

export const hasSumWithinProduct = {
	check: (correct, input) => expressionChecks.hasSumWithinProduct(input),
	text: <>Je antwoord heeft onuitgewerkte haakjes.</>,
}

export const noFraction = {
	check: (correct, input) => !input.isType(Fraction),
	text: <>Je antwoord is geen breuk. Er wordt een enkele breuk als antwoord verwacht.</>,
}
export const hasFractionWithinFraction = {
	check: (correct, input) => expressionChecks.hasFractionWithinFraction(input),
	text: <>Je antwoord mag geen verdere breuken binnenin een breuk bevatten. Je kunt het nog verder simplificeren.</>,
}
