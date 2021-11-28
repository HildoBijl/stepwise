// This file contains various feedback checks that are used more commonly among exercises. They can be loaded in and used directly then.

import { equationChecks } from 'step-wise/CAS'

const { onlyOrderChanges: onlyEquationOrderChanges, equivalent: equivalentEquation, hasSumWithinProduct: equationHasSumWithinProduct, hasFractionWithinFraction: equationHasFractionWithinFraction } = equationChecks

/*
 * Basic checks.
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

/*
 * Form of equation checks.
 */

export const hasSumWithinProduct = {
	check: (correct, input) => equationHasSumWithinProduct(input),
	text: <>Je antwoord heeft onuitgewerkte haakjes.</>,
}
export const hasFractionWithinFraction = {
	check: (correct, input) => equationHasFractionWithinFraction(input),
	text: <>Je antwoord mag geen verdere breuken binnenin een breuk bevatten. Je kunt het nog verder simplificeren.</>,
}
