class InterpretationError extends Error {
	constructor(code, cause, ...args) {
		super(...args)

		// Maintain proper stack trace for where the error was thrown.
		if (Error.captureStackTrace)
			Error.captureStackTrace(this, InterpretationError)

		// Store important data.
		this.name = 'InterpretationError'
		this.code = code
		this.cause = cause
	}
}
module.exports.InterpretationError = InterpretationError