import { describe, expect, it } from 'vitest'

import { InterpretationError } from './InterpretationError'

describe('InterpretationError', () => {
	it('carries its public error details', () => {
		const cause = { position: 2 }
		const error = new InterpretationError('Invalid input', 'Invalid', cause)
		expect(error).toBeInstanceOf(Error)
		expect(error.name).toBe('InterpretationError')
		expect(error.message).toBe('Invalid input')
		expect(error.code).toBe('Invalid')
		expect(error.cause).toBe(cause)
		expect(error.stack).toBeTypeOf('string')
	})
})
