import React from 'react'

import InterpretationError from 'step-wise/inputTypes/Expression/interpreter/InterpretationError'

import { M } from 'ui/components/equations'

export function getInterpretationErrorMessage(error) {
	// If the error is not an interpretation error, rethrow it.
	if (!(error instanceof InterpretationError))
		throw error

	// Find the code and cause and determine an informative message based on it.
	const { code, cause } = error
	switch (code) {
		// Special cases.
		case 'EmptyExpression':
			return `Er mist een (deel van een) vergelijking.`

		// Bracket interpretation.
		case 'UnmatchedClosingBracket':
			return `Er is een sluitend haakje zonder bijbehorend openingshaakje.`
		case 'UnmatchedOpeningBracket':
			return `Er is een openend haakje zonder bijbehorend sluitingshaakje.`

		// Sum interpretation.
		case 'PlusAtStart':
			return `Er staat een plus aan het begin.`
		case 'DoublePlusMinus':
			return `Er zijn twee plussen/minnen na elkaar.`
		case 'PlusMinusAtEnd':
			return `Er staat een ${cause === '+' ? 'plus' : 'min'} aan het eind.`

		// Product interpretation.
		case 'TimesAtStart':
			return `Er staat een vermenigvuldiging aan het begin van een term.`
		case 'DoubleTimes':
			return `Er staan twee vermenigvuldigingen na elkaar.`
		case 'TimesAtEnd':
			return `Er staat een vermenigvuldiging aan het einde van een term.`

		// Advanced function interpretation.
		case 'UnknownAdvancedFunction':
			return `Er is een onbekende functie aangetroffen.`

		// Basic function interpretation.
		case 'UnknownBasicFunction':
			return <>Onbekende functie "<M>{cause}\left(\ldots\right)</M>". Voor vermenigvuldiging: gebruik een vermenigvuldigingsteken "<M>{cause}\cdot\left(\ldots\right)</M>".</>

		// Accent interpretation.
		case 'UnknownAccent':
			return `Onbekend accent "${cause}".`
		case 'EmptyAccent':
			return `Er is een leeg accent.`
		case 'TooLongAccent':
			return `Er is een accent met meer dan één teken: "${cause}".`

		// String interpretation.
		case 'InvalidSymbol':
			return `Onverwacht symbool "${cause}".`
		case 'SingleDecimalSeparator':
			return `Er is een komma zonder getallen eromheen.`
		case 'MultipleDecimalSeparator':
			return `Er is een getal met meerdere komma's.`

		// Subscript/superscript interpretation.
		case 'MisplacedSubscript':
			return `Er is een subscript "${cause}" zonder variabele ervoor.`
		case 'MisplacedSuperscript':
			return `Er is een macht zonder term ervoor.`

		// Equation interpretation.
		case 'MultipleEqualsSigns':
			return `De vergelijking heeft meerdere "=" tekens.`
		case 'MissingEqualsSign':
			return `De vergelijking heeft geen "=" teken.`

		default:
			throw new Error(`Invalid interpretation error code: cannot determine what went wrong with the interpretation. The error code "${code}" is not known.`)
	}
}