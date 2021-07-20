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
		// Advanced function interpretation.
		case 'UnknownAdvancedFunction':
			return `Er is een onbekende functie aangetroffen.`

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