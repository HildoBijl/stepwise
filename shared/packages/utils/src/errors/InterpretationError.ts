// Error thrown when user input cannot be interpreted.
export class InterpretationError extends Error {
	readonly code: string
	readonly cause?: unknown

	constructor(message: string, code: string, cause?: unknown) {
		super(message)
		this.name = 'InterpretationError'
		this.code = code
		this.cause = cause

		if ('captureStackTrace' in Error) Error.captureStackTrace(this, InterpretationError)
	}
}
