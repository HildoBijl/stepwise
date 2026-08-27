import { GraphQLError } from 'graphql'

export class UnauthenticatedError extends GraphQLError {
	constructor(message: string) {
		super(message, { extensions: { code: 'UNAUTHENTICATED' } })
	}
}

export class ForbiddenError extends GraphQLError {
	constructor(message: string) {
		super(message, { extensions: { code: 'FORBIDDEN' } })
	}
}

export class InvalidInputError extends GraphQLError {
	constructor(message: string) {
		super(message, { extensions: { code: 'BAD_USER_INPUT' } })
	}
}
