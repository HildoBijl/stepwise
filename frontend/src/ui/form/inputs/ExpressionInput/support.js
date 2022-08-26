import { isEmptyObject } from 'step-wise/util/objects'
import { support } from 'step-wise/CAS'
import { alphabet as greekAlphabet } from 'step-wise/data/greek'

import { keys as mathKeys } from '../../Keyboard/keyboards/basicMath'
import { simplifyKey } from '../../Keyboard/keyboards/KeyboardLayout'

import expressionFunctions from '../mathSupport/types/Expression'

const { getEmpty } = support

const keysToCheck = [...mathKeys, ...Object.keys(greekAlphabet)]

// getEmptySI returns an empty SI object, ready to be filled by input.
export function getEmptySI(settings = {}) {
	const result = {
		type: 'Expression',
		value: getEmpty(),
	}
	if (!isEmptyObject(settings))
		result.settings = settings
	return result
}

// FIToKeyboardSettings takes an FI object and determines what keyboard settings are appropriate.
export function FIToKeyboardSettings(FI, settings) {
	// Determine which keys to disable based on the position.
	const keySettings = {}
	keysToCheck.forEach(keyboardKey => {
		const key = simplifyKey(keyboardKey)
		keySettings[keyboardKey] = expressionFunctions.acceptsKey({ key }, FI, settings)
	})

	// Pass on settings.
	return {
		keySettings,
		basicMath: {},
		textMath: {},
		greek: settings.greek && {},
	}
}

// errorToMessage turns an error during interpretation into a message to be displayed.
export function errorToMessage(error) {
	const { code, cause } = error
	switch (code) {
		// Special cases.
		case 'EmptyExpression':
			return `Er mist een (deel van een) uitdrukking.`

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
		case 'UnknownBasicFunction':
		case 'UnknownAdvancedFunction':
			return `Er is een onbekende functie "${cause}" aangetroffen.`

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

		default: return
	}
}
