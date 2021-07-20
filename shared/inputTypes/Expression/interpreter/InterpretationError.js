class InterpretationError extends Error {
	constructor(code, cause, ...args) {
		super(...args)

		// Maintain proper stack trace for where the error was thrown.
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, InterpretationError)
		}

		// Store important data.
		this.name = 'InterpretationError'
		this.code = code
		this.cause = cause
	}
}
module.exports.InterpretationError = InterpretationError

function getInterpretationErrorMessage(error) {
	const { code, cause } = error
	switch (code) {
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
			return `Er staat een vermenigvuldiging aan het eind van een term.`

		// Advanced function interpretation.
		case 'UnknownAdvancedFunction':
			return `Er is een onbekende functie aangetroffen.`

		// Basic function interpretation.
		case 'UnknownBasicFunction':
			return `Onbekende functie "${cause}(...)". Voor vermenigvuldiging: gebruik een vermenigvuldigingsteken.`

		// Accent interpretation.
		case 'UnknownAccent':
			return `Onbekend accent "${cause}".`
		case 'EmptyAccent':
			return `Er is een leeg accent.`
		case 'TooLongAccent':
			return `Er is een accent met meer dan één teken: "${cause}".`

		// String interpretation.
		case 'InvalidSymbol':
			return `Onbekend symbool "${cause}".`
		case 'SingleDecimalSeparator':
			return `Er is een komma zonder getallen eromheen.`
		case 'MultipleDecimalSeparator':
			return `Er is een getal met meerdere komma's.`

		default:
			throw new Error(`Invalid interpretation error code: cannot determine what went wrong with the interpretation. The error code "${code}" is not known.`)
	}
}
module.exports.getInterpretationErrorMessage = getInterpretationErrorMessage