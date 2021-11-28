// This file contains various feedback checks that are used more commonly among exercises. They can be loaded in and used directly then.

import { equationChecks } from 'step-wise/CAS'

const { onlyOrderChanges: onlyEquationOrderChanges, equivalent: equivalentEquation, hasSumWithinProduct: equationHasSumWithinProduct, hasFractionWithinFraction: equationHasFractionWithinFraction } = equationChecks

/*
 * Basic checks.
 */

export const originalEquation = (input, correct, { equation }) => onlyEquationOrderChanges(input, equation) && <>Dit is de oorspronkelijke vergelijking. Je hebt hier nog niets mee gedaan.</>

export const correctEquation = (input, correct, solution, isCorrect) => !isCorrect && equivalentEquation(input, correct) && <>De vergelijking klopt wel, maar je hebt niet gedaan wat gevraagd werd.</>

export const incorrectEquation = (input, correct, solution, isCorrect) => !isCorrect && !equivalentEquation(input, correct) && <>Deze vergelijking klopt niet. Je hebt bij het omschrijven iets gedaan dat niet mag.</>

/*
 * Form of equation checks.
 */

export const hasSumWithinProduct = (input) => equationHasSumWithinProduct(input) && <>Je antwoord heeft onuitgewerkte haakjes.</>

export const hasFractionWithinFraction = (input) => equationHasFractionWithinFraction(input) && <>Je antwoord mag geen verdere breuken binnenin een breuk bevatten. Je kunt het nog verder simplificeren.</>
