import { describe, expect, it } from 'vitest'

import { GraphQLError } from 'graphql'

import { ForbiddenError, InvalidInputError, UnauthenticatedError } from '../../src/errors.ts'

describe('GraphQL errors', () => {
	it.each([
		[UnauthenticatedError, 'UNAUTHENTICATED'],
		[ForbiddenError, 'FORBIDDEN'],
		[InvalidInputError, 'BAD_USER_INPUT'],
	] as const)('%s preserves its message and exposes code %s', (ErrorType, code) => {
		const error = new ErrorType('Useful message')
		expect(error).toBeInstanceOf(GraphQLError)
		expect(error.message).toBe('Useful message')
		expect(error.extensions).toEqual({ code })
	})
})
