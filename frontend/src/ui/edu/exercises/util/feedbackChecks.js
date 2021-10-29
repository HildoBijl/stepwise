// This file contains various feedback checks that are used more commonly among exercises. They can be loaded in and used directly then.

import { checks as expressionChecks } from 'step-wise/inputTypes/Expression'
import { checks as equationChecks } from 'step-wise/inputTypes/Equation'

import Sum from 'step-wise/inputTypes/Expression/Sum'
import Fraction from 'step-wise/inputTypes/Expression/functions/Fraction'

const { onlyOrderChanges: onlyExpressionOrderChanges, equivalent: equivalentExpression } = expressionChecks
const { onlyOrderChanges: onlyEquationOrderChanges, equivalent: equivalentEquation } = equationChecks

/*
 * Expression feedback checks.
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

export const noSum = {
	check: (correct, input) => !input.isType(Sum),
	text: <>Je moet de breuk schrijven als optelling/aftrekking van termen. Je antwoord is helaas geen optelling/aftrekking.</>,
}
export const sumWithWrongTermsNumber = {
	check: (correct, input) => correct.terms.length !== input.terms.length,
	text: (correct, input) => <>Je optelsom moet bestaan uit {correct.terms.length} termen, met een plus of minteken ertussen. Nu heb je {input.terms.length} termen.</>,
}
export const noFraction = {
	check: (correct, input) => !input.isType(Fraction),
	text: <>Je resultaat is geen breuk. Er wordt een breuk als antwoord verwacht.</>,
}
export const hasFractionsWithinFractions = {
	check: (correct, input) => input.numerator.recursiveSome(term => term.isType(Fraction)) || input.denominator.recursiveSome(term => term.isType(Fraction)),
	text: <>Je antwoord mag geen verdere breuken binnenin een breuk bevatten. Je kunt het nog verder simplificeren.</>,
}

/*
 * Equation feedback checks.
 */

export const originalEquation = {
	check: (correct, input, { equation }) => onlyEquationOrderChanges(equation, input),
	text: <>Dit is de oorspronkelijke vergelijking. Je hebt hier nog niets mee gedaan.</>,
}
export const correctEquation = {
	check: (correct, input) => equivalentEquation(correct, input),
	text: <>De vergelijking klopt wel, maar je hebt niet gedaan wat gevraagd werd.</>,
}
export const incorrectEquation = {
	check: (correct, input) => !equivalentEquation(correct, input),
	text: <>Deze vergelijking klopt niet. Je hebt bij het omschrijven iets gedaan dat niet mag.</>,
}